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
     },

/*
    appends @message to the message div:
*/
    display: function(message, nodeName) {
        var display,                                    // the div you'll write to
            label,                                      // what you'll write to the div
            lineBreak = document.createElement("br");   // a line break

        // if there's no nodeName, use the message div,
        // otherwise write to the given node:
        if (!nodeName) {
            display = document.getElementById("message");
        } else {
            display = document.getElementById(nodeName);
        }

        label = document.createTextNode(message);        // create the label
        display.appendChild(lineBreak);                  // add a line break
        display.appendChild(label);                      // add the message node
    },

    addDisplayNode: function(nodeName, nodeType) {
        var display = document.getElementById("message");   // all new nodes in the message div
        var node = document.createElement(nodeType);        // make the node
        node.setAttribute("id", nodeName);                  // give it an ID
        display.appendChild(node);                          // add it to the message div
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
        if (tag.ndefMessage !== null) {
            // get and display the NDEF record count:
            var records = tag.ndefMessage;
            app.display("Tag has NDEF message with " + records.length + " records.");

            var type =  nfc.bytesToString(records[0].type);
            switch (type) {
                case nfc.bytesToString(ndef.RTD_TEXT):
                    app.display("Looks like a text record to me.");
                    break;
                case nfc.bytesToString(ndef.RTD_URI):
                    app.display("That's a URI right there");
                    break;
                case nfc.bytesToString(ndef.RTD_SMART_POSTER):
                    app.display("Golly!  That's a smart poster.");
                    break;
                // add any custom types here, such as MIME types or external types:
                case 'android.com:pkg':
                    app.display("You've got yourself an AAR there.");
                    break;
                default:
                    app.display("I don't know what " +
                        type +
                        " is, must be a custom type");
                    break;
            }
            app.showMessage("Message Contents: ");
            app.showMessage(records);
        }
    },

    recordCount: 0,     // how many records have been displayed

    showMessage : function(message) {
        app.recordCount++;                          // increment the count of records to show
        var myName = "record" + app.recordCount;    // create a unique name
        app.addDisplayNode(myName, "span");         // add a display node for it

        for (var thisRecord in message) {
            record = message[thisRecord];           // get the next record in the message array
            app.showRecord(record, myName);         // show it
        }
    },
/*
    writes @record to the message div:
*/
    showRecord: function(record, nodeName) {
        // display the TNF, Type, and ID in the record's <span> node:
        app.display(" ", nodeName);
        app.display("TNF: " + record.tnf, nodeName);
        app.display("Type: " +  nfc.bytesToString(record.type), nodeName);
        app.display("ID: " + nfc.bytesToString(record.id), nodeName);

        // if the payload is a Smart Poster, it's an NDEF message.
        // read it and display it (recursion is your friend here):
        if (nfc.bytesToString(record.type) === "Sp") {
            var ndefMessage = ndef.decodeMessage(record.payload);
            app.showMessage(ndefMessage);

        // if the payload's not a Smart Poster, display it:
        } else {
            app.display("Payload: " + nfc.bytesToString(record.payload), nodeName);
        }
    },

    tnfToString: function(tnf) { // TODO this belongs in PhoneGap NFC
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
