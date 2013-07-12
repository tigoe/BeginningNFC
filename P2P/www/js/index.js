var data = [
    {    // a text/plain MIME type payload
         mimeType: 'text/plain',
         payload: 'Hello world!'
    },
    {    // a text/hue MIME type payload
        mimeType: 'text/hue',
        payload: JSON.stringify({"1":
                    {"state":
                        {"on":true,"bri":65,"hue":44591,"sat":254}
                    },
                "2":
                    {"state":
                        {"on":true,"bri":254,"hue":13122,"sat":211}
                    },
                "3":
                    {"state":
                        {"on":true,"bri":255,"hue":14922,"sat":144}
                    }
                })
    },
    {    // a vCard payload
        mimeType: 'text/x-vCard',
        payload: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Coleman;Don;;;\n' +
            'FN:Don Coleman\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:617-320-0000\n' +
            'EMAIL;WORK:don@example.com\n' +
            'END:VCARD'
    },
    {    // an Android application record
        mimeType: 'application/aar',            
        payload: 'com.joelapenna.foursquared'
    },
                              
    {    // an empty payload
         mimeType: '',
         payload: ''
    }
];

var app = {
    /*
        Application constructor
     */
    initialize: function() {
        this.bindEvents();
        console.log("Starting P2P app");
    },
    
    /*
        bind any events that are required on startup to listeners:
    */
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        sampleField.addEventListener('change', app.showSampleData, false);
        checkbox.addEventListener('change', app.onChange, false);
    },
    
    /*
        this runs when the device is ready for user interaction:
    */
    onDeviceReady: function() {
        app.clear();
        app.display("Starting P2P App.");
        
         nfc.addNdefListener(
            app.onNfc,                   // nfcEvent received
            function (status) {          // listener successfully initialized
                app.display("Listening for NDEF messages.");
            },
            function (error) {           // listener fails to initialize
                app.display("NFC reader failed to initialize "
                    + JSON.stringify(error));
            }
        );
    },
    
    /*
    displays tag from @nfcEvent in message div:
    */
    onNfc: function(nfcEvent) {
        app.clear();                  // clear the message div
        // display the event type:
        app.display(" Event Type: " + nfcEvent.type);
        app.showTag(nfcEvent.tag);    // display the tag details
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
        
        console.log("Tag ID: " + nfc.bytesToHexString(tag.id));
        console.log("Tag Type: " +  tag.type);
        console.log("Max Size: " +  tag.maxSize + " bytes");
        console.log("Is Writable: " +  tag.isWritable);
        console.log("Can Make Read Only: " +  tag.canMakeReadOnly);


        // if there is an NDEF message on the tag, display it:
        var thisMessage = tag.ndefMessage;
        if (tag.ndefMessage !== null) {
            // get and display the NDEF record count:
            app.display("Tag has NDEF message with " + thisMessage.length
                + " records.");

            var type =  nfc.bytesToString(thisMessage[0].type);
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
                // add any custom types here,
                // such as MIME types or external types:
                case 'android.com:pkg':
                    app.display("You've got yourself an AAR there.");
                    break;
                default:
                    app.display("I don't know what " +
                        type +
                        " is, must be a custom type");
                    break;
            }

            app.display("Message Contents: ");
            app.showMessage(thisMessage);
        }
    },
    
    /*
        iterates over the records in an NDEF message to display them:
    */
    showMessage: function(message) {
        for (var thisRecord in message) {
            // get the next record in the message array:
            var record = message[thisRecord];
            app.showRecord(record);             // show it
        }
    },
    
    /*
        writes @record to the message div:
    */
    showRecord: function(record) {
        // display the TNF, Type, and ID:
        app.display(" ");
        app.display("TNF: " + record.tnf);
        app.display("Type: " +  nfc.bytesToString(record.type));
        app.display("ID: " + nfc.bytesToString(record.id));

        // if the payload is a Smart Poster, it's an NDEF message.
        // read it and display it (recursion is your friend here):
        if (nfc.bytesToString(record.type) === "Sp") {
            var ndefMessage = ndef.decodeMessage(record.payload);
            app.showMessage(ndefMessage);

        // if the payload's not a Smart Poster, display it:
        } else {
            app.display("Payload: " + nfc.bytesToString(record.payload));
        }
    },
    
        
    shareMessage: function () {
        // get the mimeType, and payload from the form and create a new record:
        var mimeType = mimeTypeField.value,
            payload = payloadField.value,
            record;

        app.clear();                    // clear the last message
        app.display("Attempting to share message");
                    
        // format an Android Application Record:  
        if (mimeType === 'application/aar') {        
            var tnf = ndef.TNF_EXTERNAL_TYPE,
                 recordType = "android.com:pkg";
            record = ndef.record(tnf, recordType, [], payload);
        // format a MIME media record:    
        }  else {                          
            record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
        }
       
        // share the message:
        nfc.share(
            [record],                    // NDEF message to share
            function () {                // success callback
                navigator.notification.vibrate(100);
                app.clear();
                app.display("Success!  message shared");
                app.unshareMessage();
                checkbox.checked = false;
                
            }, function (reason) {        // failure callback
                app.clear();
                app.display("Failed to share message " + reason);
            });
    },
    
    unshareMessage: function () {
        // stop sharing this message:
        nfc.unshare(
            function () {                            // success callback
                navigator.notification.vibrate(100);
                app.clear();
                app.display("message is no longer shared");
            }, function (reason) {                    // failure callback
                app.clear();
                app.display("Failed to unshare message " + reason);
            });
    },
    
    /*
        enables or disables sharing, with the checkbox
    */
    onChange: function (e) {
        if (e.target.checked) {            // if the checkbox is checked
            app.shareMessage();            // share the record
        } else {
            app.unshareMessage();        // don't share
        }
    },

    /*
        Get data from the data array and put it in the form fields:
    */
    showSampleData: function() {
        // get the mimeType and payload from the fields
        var index = sampleField.value,
          record = data[index];
    
        //if the user wants to edit, she has to uncheck "share message":
        if (mimeTypeField.disabled) {
                app.display("Unshare message to edit data");
            return false;
        }
        
        // fill the field with the data from the record:
        mimeTypeField.value = record.mimeType;
        payloadField.value = record.payload;
        return false;    
    },

    /*
        appends @message to the message div:
    */
    display: function(message) {
        var label = document.createTextNode(message),
            lineBreak = document.createElement("br");
        messageDiv.appendChild(lineBreak);            // add a line break
        messageDiv.appendChild(label);                // add the text
    },
    /*
        clears the message div:
    */
    clear: function() {
         messageDiv.innerHTML = "";
    }
};      // end of app
