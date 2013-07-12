var app = {
/*
   Application constructor
*/
   initialize: function() {
      this.bindEvents();
      console.log("Starting MIME Message Writer app");
   },

   // bind any events that are required on startup to listeners:
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
   },
/*
   this runs when the device is ready for user interaction:
*/
   onDeviceReady: function() {
      var parentElement = document.getElementById("message");
      parentElement.innerHTML = "Tap a tag to see if it's compatible.";

      nfc.addNdefListener(
         app.onNfc,                          // tag successfully scanned
         function (status) {                 // listener successfully initialized
            app.display("Listening for NDEF tags.");
         },
         function (error) {                  // listener fails to initialize
            app.display("NFC reader failed to initialize " + JSON.stringify(error));
         }
      )

       nfc.addNdefFormatableListener(
         app.onFormat,                        // tag successfully scanned
         function (status) {                  // listener successfully initialized
            app.display("Listening for NDEF-Formattable tags.");
         },
         function (error) {                   // listener fails to initialize
            app.display("NFC reader failed to initialize " + JSON.stringify(error));
         }
      )

   },

/*
   runs when a blank formattable tag shows up.
   displays tag ID from @nfcEvent in message div:
*/
   onFormat: function(nfcEvent) {
      var tag = nfcEvent.tag;    // get the tag
      app.clear();               // clear the message div

      // write a message to the message div:
      app.display("Read NDEF tag: " + nfc.bytesToHexString(tag.id));
      app.display("This tag can be written to.");
   },

/*
   runs when an NDEF-formatted tag shows up.
   displays tag ID from @nfcEvent in message div:
*/
   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag;    // get the tag
      app.clear();               // clear the message div

      // write a message to the message div:
      app.display("Read NDEF tag: " + nfc.bytesToHexString(tag.id));
      app.display("This tag can be written to.");
      app.display("WARNING: you'll over-write the content on it already.");
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
   makes an NDEF message and calls writeTag() to write it to a tag:
*/
   makeMessage: function() {
      // Put together the pieces for the NDEF message:
      var tnf = ndef.TNF_MIME_MEDIA,            // NDEF Type Name Format
         recordType = document.forms[0].elements["mimeType"].value, // RTD
         payload = document.forms[0].elements["payload"].value,     // content
         record,                   // NDEF record object
         message = [];             // NDEF Message to pass to writeTag()

      // create the actual NDEF record:
      record = ndef.record(tnf, recordType, [], payload);
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
         message,                 // write the record itself to the tag
         function () {            // when complete, run this callback function:
            app.clear();                     // clear the message div
            app.display("Wrote data to tag.");     // notify the user in message div
            navigator.notification.vibrate(100);   // vibrate the device as well
         },
         function (reason) {     // this function runs if the write command fails
            navigator.notification.alert(reason, function() {}, "There was a problem");
         }
      );
   }
};        // end of app
