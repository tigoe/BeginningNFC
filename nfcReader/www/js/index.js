var app = {
/*
   Application constructor
 */
   initialize: function() {
      this.bindEvents();
      console.log("Starting NFC Reader app");
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
         app.onNfc,             // tag successfully scanned
         function (status) {    // listener successfully initialized
            app.display("Tap a tag to read its id number.");
         },
         function (error) {     // listener fails to initialize
            app.display("NFC reader failed to initialize " +
               JSON.stringify(error));
         }
      );
   },

/*
   displays tag ID from @nfcEvent in message div:
*/

   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag;
      app.display("Read tag: " + nfc.bytesToHexString(tag.id));
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
