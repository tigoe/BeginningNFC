var app = {
/*
   Application constructor
*/
    initialize: function() {
      this.bindEvents();
      console.log("Starting NDEF Events app");
   },
/*
   bind any events that are required on startup to listeners:
*/
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
   },

/*
   this runs when the device is ready for user interaction:
*/
   onDeviceReady: function() {

      nfc.addTagDiscoveredListener(
         app.onNonNdef,           // tag successfully scanned
         function (status) {      // listener successfully initialized
            app.display("Listening for NFC tags.");
         },
         function (error) {       // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      );

      nfc.addNdefFormatableListener(
         app.onNonNdef,           // tag successfully scanned
         function (status) {      // listener successfully initialized
            app.display("Listening for NDEF Formatable tags.");
         },
         function (error) {       // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      );

      nfc.addNdefListener(
         app.onNfc,               // tag successfully scanned
         function (status) {      // listener successfully initialized
            app.display("Listening for NDEF messages.");
         },
         function (error) {       // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      );

      nfc.addMimeTypeListener(
         "text/plain",
         app.onNfc,               // tag successfully scanned
         function (status) {      // listener successfully initialized
            app.display("Listening for plain text MIME Types.");
         },
         function (error) {       // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      );

      app.display("Tap a tag to read data.");
   },

   /*
      appends @message to the message div:
   */
   display: function(message) {
      var label = document.createTextNode(message),
         lineBreak = document.createElement("br");
      messageDiv.appendChild(lineBreak);         // add a line break
      messageDiv.appendChild(label);             // add the text
   },
   /*
      clears the message div:
   */
   clear: function() {
       messageDiv.innerHTML = "";
   },

   /*
      Process NDEF tag data from the nfcEvent
   */
   onNfc: function(nfcEvent) {
      app.clear();              // clear the message div
      // display the event type:
      app.display(" Event Type: " + nfcEvent.type);
      app.showTag(nfcEvent.tag);   // display the tag details
   },
   
   /*
      Process non-NDEF tag data from the nfcEvent
      This includes 
       * Non NDEF NFC Tags
       * NDEF Formatable Tags
       * Mifare Classic Tags on Nexus 4, Samsung S4 
       (because Broadcom doesn't support Mifare Classic)
   */
   onNonNdef: function(nfcEvent) {
      app.clear();              // clear the message div
      // display the event type:
      app.display("Event Type: " + nfcEvent.type);
      var tag = nfcEvent.tag;
      app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
      app.display("Tech Types: ");
      for (var i = 0; i < tag.techTypes.length; i++) {
         app.display("  * " + tag.techTypes[i]);
      }
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
      var thisMessage = tag.ndefMessage;
      if (thisMessage !== null) {
         // get and display the NDEF record count:
         app.display("Tag has NDEF message with " + thisMessage.length
            + " record" + (thisMessage.length === 1 ? ".":"s."));

         // switch is part of the extended example
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
         // end of extended example

         app.display("Message Contents: ");
         app.showMessage(thisMessage);
      }
   },
/*
   iterates over the records in an NDEF message to display them:
*/
   showMessage: function(message) {
      for (var i=0; i < message.length; i++) {
         // get the next record in the message array:
         var record = message[i];
         app.showRecord(record);          // show it
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
   }
};     // end of app
