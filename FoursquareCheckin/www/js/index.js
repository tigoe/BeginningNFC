var app = {
   messageToWrite: [],     // message to write on next NFC event
   
   // Application constructor
   initialize: function() {
      this.bindEvents();
      console.log("Starting Foursquare Checkin app");
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
      app.clear();

      nfc.addTagDiscoveredListener(
         app.onNfc,             // tag successfully scanned
         function (status) {    // listener successfully initialized
            app.makeMessage();
            app.display("Tap an NFC tag to write data");
         },
         function (error) {     // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      )
   },

   /*
      called when a NFC tag is read:
   */
   onNfc: function(nfcEvent) {
      app.writeTag(app.messageToWrite);
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

   makeMessage: function() {
      // Put together the pieces for the NDEF message:
      var tnf = ndef.TNF_EXTERNAL_TYPE,           // NDEF Type Name Format
         recordType = "android.com:pkg",          // NDEF Record Type
         payload = "com.joelapenna.foursquared",  // content of the record
         record,                  // NDEF record object
         message = [];            // NDEF Message to pass to writeTag()

      // create the actual NDEF record:
      record = ndef.record(tnf, recordType, [], payload);
      // put the record in the message array:
      message.push(record);
      app.messageToWrite = message;
   },

   writeTag: function(message) {
      // write the record to the tag:
      nfc.write(
         message,           // write the record itself to the tag
         function () {      // when complete, run this callback function:
            app.display("Wrote data to tag.");   // write to the message div
         },
         // this function runs if the write command fails:
         function (reason) {
            alert("There was a problem " + reason);
         }
      );
   }
};     // end of app
