var app = {
    // Application constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting MIME filter app");
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // this runs when the device is ready for user interaction:
    onDeviceReady: function() {
        var parentElement = document.getElementById("message");
        parentElement.innerHTML = "Tap a tag to read its id number.";

        nfc.addNdefListener(
            app.onNfc,                                  // tag successfully scanned
            function (status) {                         // listener successfully initialized
                app.display("Listening for NDEF messages.");
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );

        // nfc.addMimeTypeListener(
        //     "text/plain",
        //     app.onNfc,                                  // tag successfully scanned
        //     function (status) {                         // listener successfully initialized
        //         app.display("Listening for MIME Types.");
        //     },
        //     function (error) {                          // listener fails to initialize
        //         app.display("NFC reader failed to initialize " + JSON.stringify(error));
        //     }
        // );
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
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

    onNfc: function(nfcEvent) {
        app.clear();                                     // clear the message div
        app.display(" Event Type: " + nfcEvent.type);    // display the event type
        app.showTag(nfcEvent.tag);                       // display the tag details
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

            var mimeType =  nfc.bytesToString(records[0].type);

            switch (mimeType) {
                case ndef.RTD_TEXT:
                    app.display("Looks like text to me.");
                    break;
                case ndef.RTD_URI:
                    app.display("That's a URI right there");
                    break;
                case ndef.RTD_SMART_POSTER:
                    app.display("Golly!  That's a smart poster.");
                    break;
                default:
                    if (mimeType === "android.com:pkg") {
                        app.display("You've got yourself an AAR there.");
                    } else {
                        app.display("I don't know what " +
                            mimeType +
                            " is, must be a custom MIME type");
                    }
                    break;
            }
            app.display("MIME type: " + mimeType);
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
            var displayString = thisProperty + ":";
            switch(thisProperty) {
                case 'id':
                    displayString += value.toString();
                    break;
                case 'type':
                    displayString += nfc.bytesToString(value);
                    break;
                case 'payload':
                    // need to do something different if the payload is an ndefMessage:
                   /*
                    if (record[thisProperty] instanceof ndefMessage) {
                        // you need to process the smart poster now

                    } else {
                    */
                    displayString += nfc.bytesToString(value);
                    //}
                    break;
                case 'tnf':
                    displayString += app.tnfToString(value);
                    break;

            }
            app.display(displayString);
        }
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
