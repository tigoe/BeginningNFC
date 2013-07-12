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
      )
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
      var display = document.getElementById("message"),   // the div you'll write to
         label,                                // what you'll write to the div
         lineBreak = document.createElement("br");      // a line break

      label = document.createTextNode(message);         // create the label
      display.appendChild(lineBreak);                // add a line break
      display.appendChild(label);                   // add the message node
   },
/*
   clears the message div:
*/
   clear: function() {
      var display = document.getElementById("message");
      display.innerHTML = "";
   }
};     // end of app
