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
        );
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
        var appType = parseInt(document.forms[0].elements.appType.value, 10),
            tnf,                // NDEF Type Name Format
            recordType,         // NDEF Record Type
            payload,            // content of the record
            record,             // NDEF record object
            message = [];       // NDEF Message to pass to writeTag()

         switch (appType) {
            case 1:         // like NFC Task Launcher
                // format the MIME media record:
                recordType = "x/nfctl";
                payload = nfc.stringToBytes("enZ:Foursquare;c:4a917563f964a520401a20e3");
                record = ndef.mimeMediaRecord(recordType, payload);
                message.push(record);       // push the record onto the message

                // format the Android Application Record:
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.jwsoft.nfcactionlauncher");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);      // push the record onto the message
                break;
            case 2:         // like Tagstand Writer
                // format the URI record as a Well-Known Type:
                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_URI;      // add the URI record type
                // convert to an array of bytes:
                payload = nfc.stringToBytes("m.foursquare.com/venue/4a917563f964a520401a20e3");
                payload.unshift(0x03);          // add the URI identifier code for "http://"
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);      // push the record onto the message
                break;
            case 3:         // like NXP TagWriter

                // The payload of a Smart Poster record, is an NDEF message
                smartPosterPayload = [
                    ndef.uriRecord("http://m.foursquare.com/venue/4a917563f964a520401a20e3"),
                    ndef.textRecord("FourSquare Checkin", "en"),
                    ndef.record( // Android Application Record
                        ndef.TNF_EXTERNAL_TYPE, 
                        nfc.stringToBytes("android.com:pkg"), [], 
                        nfc.stringToBytes("com.joelapenna.foursquared")
                    )
                ];

                // Create the Smart Poster Record
                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_SMART_POSTER;                
                payload = ndef.encodeMessage(smartPosterPayload);            
                record = ndef.record(tnf, recordType, [], payload);
                
                message.push(record); // push the smart poster record onto the message
                break;
            case 4:         // like TecTiles
                // format the record as a Well-Known Type
                tnf = ndef.TNF_WELL_KNOWN;
                recordType = ndef.RTD_URI;      // add the URI record type
                payload = nfc.stringToBytes("tectile://www/samsung.com/us/microsite/error?action=foursquare_checkin&payload=http://m.foursquare.com/venue/4a917563f964a520401a20e3");
                payload.unshift(0x00);      // URI identifier 0x00 because there's no ID for "tectile://"
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);      // push the record onto the message

                // format the Android Application Record:
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.samsung.tectile");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);      // push the record onto the message
                console.log("External type.");
                break;
            case 5:         // like App Launcher NFC
                // format the Android Application Record:
                tnf = ndef.TNF_EXTERNAL_TYPE;
                recordType = nfc.stringToBytes("android.com:pkg");
                payload = nfc.stringToBytes("com.joelapenna.foursquared");
                record = ndef.record(tnf, recordType, [], payload);
                message.push(record);      // push the record onto the message
                break;
        }
        console.log("App Type: " + appType);
        app.writeTag(message);
    },

    writeTag: function(message) {
        // write the message to the tag:
        nfc.write(
            message,								// write the message itself to the tag
            function () {							// when complete, run this callback function:
                app.display("Wrote data to tag.");		// notify the user in text on the screen
                navigator.notification.vibrate(100);	// vibrate the device as well
            },
            function (reason) {						// this function runs if the write command fails
                navigator.notification.alert(reason, function() {}, "There was a problem");
            }
        );
    }
};          // end of app
