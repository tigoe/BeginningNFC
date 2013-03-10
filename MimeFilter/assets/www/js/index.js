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
    display: function(message) {
        var display = document.getElementById("message"),   // the div you'll write to
            label,                                          // what you'll write to the div
            lineBreak = document.createElement("br");       // a line break

        // KLUDGE - Smart Poster has embedded HTML
        if (message.indexOf("&nbsp;") > -1) {
            label = document.createElement("span");
            label.innerHTML = message;
        } else {
            label = document.createTextNode(message);           // create the label
        }
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
        if (tag.ndefMessage !== null) {
            // get and display the NDEF record count:
            var records = tag.ndefMessage;
            app.display("Tag has NDEF message with " + records.length + " records.");

            var type =  nfc.bytesToString(records[0].type);
            switch (type) {
                case nfc.bytesToString(ndef.RTD_TEXT):
                    app.display("Looks like text to me.");
                    break;
                case nfc.bytesToString(ndef.RTD_URI):
                    app.display("That's a URI right there");
                    break;
                case nfc.bytesToString(ndef.RTD_SMART_POSTER):
                    app.display("Golly!  That's a smart poster.");
                    break;

                // the user can add cases here:
                case 'android.com:pkg':
                    app.display("You've got yourself an AAR there.");
                    break;
                default:
                        app.display("I don't know what " +
                            type +
                            " is, must be a custom MIME type");
                    break;
            }
            app.display("type: " + type);
            // display the details of each NDEF record:
            for (var thisRecord in records)  {
                app.showRecord(records[thisRecord]);
            }
        }
    },

/*
    writes @record to the message div:
*/
    showRecord: function(record) {
        var value,                  // value of a given record element
            displayString;          // the string to display onscreen

        app.display(" ");           // show a blank line before the record
        // iterate over the record's properties:
        for (var thisProperty in record) {
            value = record[thisProperty];   // get the array element value

            // BEGIN SMART POSTER HACK
            if (thisProperty === "payload" && (nfc.bytesToString(record.type)) === "Sp") {

                // the payload of a smartposter is an NDEF message
                var ndefMessage = ndef.decodeMessage(record.payload);

                // show each record
                for (var i = 0; i < ndefMessage.length; i++) { // need zepto or jquery $.each
                    var ndefRecord = ndefMessage[i];

                    // This would be SO much clearer with a template (handlebars | mustache | underscore)
                    value += "<br/>&nbsp;&nbsp;Record: <br/>" +
                        "&nbsp;&nbsp;&nbsp;&nbsp;TNF: " + ndefRecord.tnf + "<br/>" +
                        "&nbsp;&nbsp;&nbsp;&nbsp;Type: " + nfc.bytesToString(ndefRecord.type) + "<br/>" +
                        "&nbsp;&nbsp;&nbsp;&nbsp;Payload: " + nfc.bytesToString(ndefRecord.payload);

                    if (ndefRecord.id.length) {
                        value += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;Id: " + nfc.bytesToString(ndefRecord.id);
                    }
                }
            } // END SMART POSTER

            if (value instanceof Array) {  // type, payload and id are all byte arrays
                displayString = thisProperty + ":" + nfc.bytesToString(value);
            } else { // TNF and decoded SmartPoster payloads are Strings
                displayString = thisProperty + ":"  + value;
            }
            app.display(displayString);
        }
    },

    rtdToString: function(rtd) {
        return rtd.join("");

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
