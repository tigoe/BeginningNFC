var app = {
	writeFlag: false,			// write flag for NFC event handler
	messageToWrite: [],		// message to write on next NFC event
	
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
      writeButton.addEventListener('touchstart', app.makeMessage, false);
   },

   /*
      this runs when the device is ready for user interaction:
   */
   onDeviceReady: function() {
      app.clear();
      app.display("Tap a tag to read its id number.");

      nfc.addTagDiscoveredListener(
         app.onNfc,             // tag successfully scanned
         function (status) {    // listener successfully initialized
            app.display("Listening for NFC tags.");
         },
         function (error) {     // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      )
   },

   /*
      displays tag ID from @nfcEvent in message div:
   */
   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag;
      app.display("Read tag: " + nfc.bytesToHexString(tag.id));
      if (app.writeFlag === true) {
	       //write the message if the write flag is set:
			 app.writeTag(app.messageToWrite);
			 app.writeFlag = false;			// clear the write flag
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
     // set the writeFlag so that the next time a tag appears, you write to it:
     app.writeFlag = true;
     app.messageToWrite = message;
     app.display("waiting for a writable tag to appear...");
   },

   writeTag: function(message) {
      // write the record to the tag:
      nfc.write(
         message,           // write the record itself to the tag
         function () {      // when complete, run this callback function:
            app.clear();    // clear the message div
            app.display("Wrote data to tag.");   // write to the message div
         },
         // this function runs if the write command fails:
         function (reason) {
            alert("There was a problem " + reason);
         }
      );
   }
};     // end of app
