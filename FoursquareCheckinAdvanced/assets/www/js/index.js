var app = {
    // Application constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting Foursquare Checkin app");
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // this runs when the device is ready for user interaction:
    onDeviceReady: function() {
        var parentElement = document.getElementById("message");
        parentElement.innerHTML = "Tap a tag to read its id number.";

        nfc.addTagDiscoveredListener(
            app.onNfc,                                  // tag successfully scanned
            function (status) {                         // listener successfully initialized
                app.display("Listening for NFC tags.");
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        )
    },

    onNfc: function(nfcEvent) {
        var tag = nfcEvent.tag;
        app.display("Read NDEF tag: " + nfc.bytesToHexString(tag.id));
    },

    display: function(message) {
        document.getElementById("message").innerHTML = message;
    },


    formatMessage: function() {
        // get the app type that the user wants to emulate from the HTML form:
        var appType = parseInt(document.forms[0].elements["appType"].value),
            tnf,                // NDEF Type Name Format
            recordType,         // NDEF Record Type
            payload,            // content of the record
            record,             // NDEF record object
            message = [];       // NDEF Message to pass to writeTag()

         switch (appType) {
            case 1:         // like NFC Task Launcher
                recordType = "x/nfctl";
                payload = nfc.stringToBytes("enZ:Foursquare;c:4a917563f964a520401a20e3");
                record = ndef.mimeMediaRecord(recordType, payload);
                message.push(record);
                console.log("MIME media record.");
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.jwsoft.nfcactionlauncher");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("External type.");
                break;
            case 2:         // like Tagstand Writer
                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_URI;
                payload = nfc.stringToBytes("m.foursquare.com/venue/4a917563f964a520401a20e3");
                payload.unshift(0x03);
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("TNF_WELL_KNOWN; URI record.");
                break;
            case 3:         // like NXP TagWriter
                var smartPosterRecord = [];
                record = ndef.uriRecord("http://m.foursquare.com/venue/4a917563f964a520401a20e3");
                smartPosterRecord.push(record);
                console.log("URI record.");

                record = ndef.textRecord("foursquare checkin");
                smartPosterRecord.push(record);
                console.log("Text record.");

                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_SMART_POSTER;
                var spPayload = ndef.record(tnf, recordType, [], smartPosterRecord);
                message.push(spPayload);
                console.log("Smart Poster record.");

                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.joelapenna.foursquared");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("External type.");
                break;
            case 4:         // like TecTiles
                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_URI;
                payload = nfc.stringToBytes("tectile://www/samsung.com/us/microsite/error?action=foursquare_checkin&payload=http://m.foursquare.com/venue/4a917563f964a520401a20e3");
                payload.unshift(0x00);
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("Well Known; URI record.");
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.samsung.tectile");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("External type.");
                break;
            case 5:         // like App Launcher NFC
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.joelapenna.foursquared");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);
                console.log("External type.");
                break;
        }
        console.log("App Type: " + appType);
        app.writeTag(message);
    },

    writeTag: function(message) {
        // write the message to the tag:
        nfc.write(
            message,									// write the message itself to the tag
            function () {								// when complete, run this callback function:
                app.display("Wrote data to tag.");		// notify the user in text on the screen
                navigator.notification.vibrate(100);	// vibrate the device as well
            },
            function (reason) {							// this function runs if the write command fails
                navigator.notification.alert(reason, function() {}, "There was a problem");
            }
        );
    }
};
