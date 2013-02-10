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
        var tnf = parseInt(document.forms[0].elements["tnf"].value),
            recordType = document.forms[0].elements["recordType"].value,
            payload = nfc.stringToBytes(document.forms[0].elements["payload"].value),
            record;

            console.log("tnf: " + tnf + "  record type: " + recordType + "   payload: " + payload);


/*

        I have work to do here. Make sure RTD is formatted correctly, make sure URL shorteners, etc
        are attached properly. Probably make it less generic, for the purposes of teaching the lesson.
        -Tom

*/
        switch (tnf) {
            case ndef.TNF_WELL_KNOWN:
                payload.unshift(0x03);           // add URL shortener code
                record = ndef.record(ndef.TNF_WELL_KNOWN, nfc.stringToBytes(recordType), [], payload);
                console.log("Well Known record.");
                break;
            case ndef.TNF_MIME_MEDIA:
                payload.unshift(0x03);
                record = ndef.mimeMediaRecord(recordType, payload);
                console.log("MIME record.");
                break;
            case ndef.TNF_ABSOLUTE_URI:
                payload.unshift(0x03);           // add URL shortener code
                record = ndef.uriRecord(document.forms[0].elements["payload"].value);
                console.log("URI record");
                break;
            case ndef.TNF_EXTERNAL_TYPE:
                record = ndef.record(ndef.TNF_EXTERNAL_TYPE, nfc.stringToBytes(recordType), [], payload);
                console.log("External record");
                break;
        }

        console.log("record is type: " + tnf);

       // Put together the pieces for the NDEF record:
       // var recordType = nfc.stringToBytes("android.com:pkg");                // record type: android application record
       // var payload = nfc.stringToBytes("com.joelapenna.foursquared");        // application name
       // create the actual NDEF record:
       //  var record = ndef.record(ndef.TNF_EXTERNAL_TYPE, recordType, [], payload);
/*
   // Put together the pieces for the NDEF record:
        var recordType = nfc.stringToBytes("android.com:pkg");  // record type: android application record
        var payload = nfc.stringToBytes("com.joelapenna.foursquared");  // application name

        // create the actual NDEF record:
        var record = ndef.record(ndef.TNF_EXTERNAL_TYPE, recordType, [], payload);
*/
        app.writeTag(record);


    },

    writeTag: function(record) {
        // write the record to the tag:
        nfc.write(
            [record],									// write the record itself to the tag
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
