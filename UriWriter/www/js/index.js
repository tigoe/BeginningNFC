var app = {
/*
    Application constructor
*/
    initialize: function() {
        this.bindEvents();
        console.log("Starting NDEF Message Writer app");
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        app.clear();
        app.display("Tap a tag to see if it's compatible.");

        nfc.addNdefListener(
            app.onNfc,                      // tag successfully scanned
            function (status) {             // listener successfully initialized
                app.display("Listening for NDEF tags.");
            },
            function (error) {              // listener fails to initialize
                app.display("NFC reader failed to initialize " +
                	JSON.stringify(error));
            }
        );
    },

/*
    runs when an NDEF-formatted tag shows up.
    displays tag ID from @nfcEvent in message div:
*/
    onNfc: function(nfcEvent) {
        var tag = nfcEvent.tag;         // get the tag
        app.clear();                    // clear the message div

        // write a message to the message div:
        app.display("Read NDEF tag: " + nfc.bytesToHexString(tag.id));
        app.display("This tag can be written to.");
        app.display("WARNING: you'll over-write the content on it already.");
     },


/*
    appends @message to the message div:
*/
    display: function(message) {
    	// the div you'll write to:
        var display = document.getElementById("message"),   
            label,                                          // what you'll write
            lineBreak = document.createElement("br");       // a line break

        label = document.createTextNode(message);           // create the label
        display.appendChild(lineBreak);                     // add a line break
        display.appendChild(label);                         // add the message
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

/*
    makes an NDEF message and calls writeTag() to write it to a tag:
*/
    makeMessage: function() {
        // Put together the pieces for the NDEF message:
        // NDEF Type Name Format:
        var tnf = parseInt(tnf.value),
            recordType = mimeType.value, // RTD
            payload = payload.value,     // content
            record,                      // NDEF record object
            message = [];                // NDEF Message to pass to writeTag()

        // if the TNF is Well-Known, then write a URI record:
        if (tnf === ndef.TNF_WELL_KNOWN) {
            record = ndef.uriRecord(payload);

        // otherwise, write a MIME record:
        } else if (tnf === ndef.TNF_MIME_MEDIA) {
            record = ndef.mimeMediaRecord(recordType, payload);
        }
        // put the record in the message array:
        message.push(record);
        //write the message:
        app.writeTag(message);
    },

/*
    writes NDEF message @message to a tag:
*/
    writeTag: function(message) {
        // write the record to the tag:
        nfc.write(
            message,                      // write the record itself to the tag
            function () {                 // when complete, run this callback
                app.clear();                          // clear the message div
                app.display("Wrote data to tag.");    // notify the user
                navigator.notification.vibrate(100);  // vibrate the device
            },
            function (reason) {         // failure function
                navigator.notification.alert(reason, function() {}, 
                	"There was a problem");
            }
        );
    }
};          // end of app
