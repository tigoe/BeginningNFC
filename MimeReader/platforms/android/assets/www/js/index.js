/*jshint indent:3, quotmark:false, strict:false, unused:vars */
/*global nfc, messageDiv */
var app = {
/*
   Application constructor
 */
   initialize: function() {
      this.bindEvents();
      console.log("Starting MIME Reader app");
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
      app.display("Tap a tag to read its id number.");

      nfc.addMimeTypeListener(
         "text/plain",              // listen for plain text messages
         app.onNfc,                 // tag successfully scanned
         function (status) {        // listener successfully initialized
            app.display("Listening for plan text MIME messages.");
         },
         function (error) {         // listener fails to initialize
            app.display("NFC reader failed to initialize " + JSON.stringify(error));
         }
      );
   },

/*
   displays tag from @nfcEvent in message div:
*/

   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag;
      app.display("Read tag: " + nfc.bytesToHexString(tag.id));

      var thisMessage = tag.ndefMessage;
      if (thisMessage !== null) {
         app.display("Message: " + nfc.bytesToString(thisMessage[0].payload));
      }
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
   }
};     // end of app
