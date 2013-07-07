var app = {
    // Application constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting Multi MIME listener app");
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // this runs when the device is ready for user interaction:
    onDeviceReady: function() {
        var parentElement = document.getElementById("message");
        parentElement.innerHTML = "Tap a tag to read its id number.";

        nfc.addMimeTypeListener(
            "text/plain",
            function (tag) {                         // tag successfully scanned
                app.display("Got a text MIME");
                app.onText(tag);
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );


        nfc.addMimeTypeListener(
            "text/pg",
              function (tag) {                         // tag successfully scanned
                app.display("got a pg MIME");
                app.onVcard(tag);
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );

          nfc.addMimeTypeListener(
            "text/x-vCard",
              function (tag) {                         // tag successfully scanned
                app.display("got a vCard MIME");
                app.onVcard(tag);
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );

    },

    onText: function(nfcTag) {
        app.clear();                                     // clear the message div
        //app.display(" Event Type: " + nfcEvent.type);    // display the event type
        app.display("I got a plain text MIME");
        app.showTag(nfcTag);                       // display the tag details
    },

    onVcard: function(nfcTag) {
        app.clear();                                     // clear the message div
        //app.display(" Event Type: " + nfcEvent.type);    // display the event type
        app.display("I got a vCard MIME");
        app.showTag(nfcTag);                       // display the tag details
    },

/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

/*
    writes @tag to the message div:
*/

    showTag: function(tag) {
        // display the tag properties:
        app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
        app.display("Tag Type: " +  tag.type);
        app.display("Max Size: " +  tag.maxSize + " bytes");
        app.display("Is Writable: " +  tag.isWritable);
        app.display("Can Make Read Only: " +  tag.canMakeReadOnly);

        // if there is an NDEF message on the tag, display it:
        if (tag.ndefMessage != null) {
            // get and display the NDEF record count:
            var records = tag.ndefMessage;
            app.display("Tag has NDEF message with " + records.length + " records.")

            // display the details of each NDEF record:
            for (thisRecord in records)  {
                app.showRecord(records[thisRecord]);
            }
        }
    },

/*
    writes @record to the message div:
*/
    showRecord: function(record) {
        app.display(" ");           // show a blank line before the record
        // iterate over the record's properties:
        for (thisProperty in record) {
            var value = record[thisProperty];   // get the array element value

            if (thisProperty === "id") {
                // id is a single-byte array with numeric values, so use toString:
                app.display(thisProperty + ":" + (value.toString()));
            } else if (thisProperty === "tnf") {
                // Convert TNF to a string:
                var tnfString = app.tnfToString(value);
                app.display(thisProperty + ":" + tnfString);

            } else {
                // the other properties are multi-byte arrays so use nfc.bytesToString():
                app.display(thisProperty + ":" + nfc.bytesToString(value));
            }
        }
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"),   // the div you'll write to
            label,                                          // what you'll write to the div
            lineBreak = document.createElement("br");       // a line break

        label = document.createTextNode(message);           // create the label
        display.appendChild(lineBreak);                     // add a line break
        display.appendChild(label);                         // add the message node
    },

    tnfToString: function(tnf) {
        var value = tnf;

        switch (tnf) {
        case ndef.TNF_EMPTY:
            value = "Empty";
            break;
        case ndef.TNF_WELL_KNOWN:
            value = "Well Known";
            break;
        case ndef.TNF_MIME_MEDIA:
            value = "Mime Media";
            break;
        case ndef.TNF_ABSOLUTE_URI:
            value = "Absolute URI";
            break;
        case ndef.TNF_EXTERNAL_TYPE:
            value = "External";
            break;
        case ndef.TNF_UNKNOWN:
            value = "Unknown";
            break;
        case ndef.TNF_UNCHANGED:
            value = "Unchanged";
            break;
        case ndef.TNF_RESERVED:
            value = "Reserved";
            break;
        }
        return value;
    }
};          // end of app
