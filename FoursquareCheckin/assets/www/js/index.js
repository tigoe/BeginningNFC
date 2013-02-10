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

    writeTag: function() {
	    // Put together the pieces for the NDEF record:
        var recordType = nfc.stringToBytes("android.com:pkg");	// record type: android application record
        var payload = nfc.stringToBytes("com.joelapenna.foursquared");	// application name

        // create the actual NDEF record:
        var record = ndef.record(ndef.TNF_EXTERNAL_TYPE, recordType, [], payload);

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
