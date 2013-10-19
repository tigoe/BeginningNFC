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

      nfc.addMimeTypeListener(
         "text/plain",              // listen for plain text messages
         app.onNfc,                 // tag successfully scanned
         function (status) {        // listener successfully initialized
            app.display("Tap an NFC tag to begin");
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
      var tag = nfcEvent.tag,
         text = "",
         payload;

      app.clear();
      app.display("Read tag: " + nfc.bytesToHexString(tag.id));

      // get the playload from the first message
      payload = tag.ndefMessage[0].payload;

      if (payload[0] < 5) {
         // payload begins with a small integer, it's encoded text
         var languageCodeLength = payload[0];

         // chop off the language code and convert to string
         text = nfc.bytesToString(payload.slice(languageCodeLength + 1));

      } else {
         // assume it's text without language info
         text = nfc.bytesToString(payload);
      }

      app.display("Message: " + text);

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
