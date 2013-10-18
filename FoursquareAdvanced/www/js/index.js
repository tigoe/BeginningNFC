 var app = {
	messageToWrite: [],		// message to write on next NFC event

     // Application constructor
   initialize: function() {
     this.bindEvents();
     console.log("Starting Foursquare Checkin Advanced app");
   },
   
   /*
     bind any events that are required on startup to listeners:
   */
   bindEvents: function() {
     document.addEventListener('deviceready', this.onDeviceReady, false);
     appPicker.addEventListener('change', app.makeMessage, false);
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
       },
       function (error) {     // listener fails to initialize
         app.display("NFC reader failed to initialize "
            + JSON.stringify(error));
       }
     )
   },

   /*
     write a message when a tag is in range:
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
     // get the app type that the user wants to emulate from the HTML form:
     var appType = parseInt(appPicker.value, 10),
       tnf,             // NDEF Type Name Format
       recordType,      // NDEF Record Type
       payload,         // content of the record
       record,          // NDEF record object
       message = [];    // NDEF Message to pass to writeTag()

      app.clear();
      
      switch (appType) {
       case 1:      // like NFC Task Launcher
         // format the MIME media record:
         recordType = "x/nfctl";
         payload = "enZ:Foursquare;c:4a917563f964a520401a20e3";
         record = ndef.mimeMediaRecord(recordType, payload);
         message.push(record);     // push the record onto the message

         // format the Android Application Record:
         tnf = ndef.TNF_EXTERNAL_TYPE;
         recordType = "android.com:pkg";
         payload = "com.jwsoft.nfcactionlauncher";
         record = ndef.record(tnf, recordType, [], payload);
         message.push(record);    // push the record onto the message
         break;
       case 2:      // like Tagstand Writer
         // format the URI record as a Well-Known Type:
         tnf = ndef.TNF_WELL_KNOWN;
         recordType = ndef.RTD_URI;    // add the URI record type
         // convert to an array of bytes:
         payload = nfc.stringToBytes(
            "m.foursquare.com/venue/4a917563f964a520401a20e3");
         // add the URI identifier code for "http://":
         payload.unshift(0x03);
         record = ndef.record(tnf, recordType, [], payload);
         message.push(record);         // push the record onto the message
         break;
        case 3:      // like NXP TagWriter
          // The payload of a Smart Poster record is an NDEF message
          // so create an array of two records like so:
          var smartPosterPayload = [
            ndef.uriRecord(
              "http://m.foursquare.com/venue/4a917563f964a520401a20e3"),
            ndef.textRecord("foursquare checkin"),
          ];

          // Create the Smart Poster Record from the array:
          record = ndef.smartPoster(smartPosterPayload);
          // push the smart poster record onto the message:
          message.push(record);
          break;
      case 4:      // like TecTiles
          // format the record as a Well-Known Type
          tnf = ndef.TNF_WELL_KNOWN;
          recordType = ndef.RTD_URI;    // add the URI record type
          var uri = "tectiles://www.samsung.com/tectiles";
          payload = nfc.stringToBytes(uri);
          var id = nfc.stringToBytes("0");
          // URI identifier 0x00 because there's no ID for "tectile://":
          payload.unshift(0x00);
          record = ndef.record(tnf, recordType, id, payload);
          message.push(record);    // push the record onto the message

          // text record with binary data
          tnf = ndef.TNF_WELL_KNOWN;
          recordType = ndef.RTD_TEXT;
          payload = [];
          // language code length
          payload.push(2);
          // language code
          payload.push.apply(payload, nfc.stringToBytes("en"));
          // Task Name
          payload.push.apply(payload, nfc.stringToBytes("Task"));
          // 4 mystery bytes, copied verbatim
          payload.push.apply(payload, [10, 31, 29, 19]);
          // Application Name
          payload.push.apply(payload, nfc.stringToBytes("Foursquare"));
          // NULL terminator
          payload.push(0);
          // Activity to launch
          payload.push.apply(payload, nfc.stringToBytes("com.joelapenna.foursquared.MainActivity"));
          // NULL terminator
          payload.push(0);
          // Application packageName
          payload.push.apply(payload, nfc.stringToBytes("com.joelapenna.foursquared"));
          id = nfc.stringToBytes("1");
          record = ndef.record(tnf, recordType, id, payload);
          message.push(record);    // push the record onto the message
          break;

       case 5:      // like App Launcher NFC
         // format the Android Application Record:
         tnf = ndef.TNF_EXTERNAL_TYPE;
         recordType = "android.com:pkg";
         payload = "com.joelapenna.foursquared";
         record = ndef.record(tnf, recordType, [], payload);
         message.push(record);    // push the record onto the message
         break;
     }   // end of switch-case statement
     app.messageToWrite = message;
     app.display("Tap an NFC tag to write data");
   },   // end of makeMessage()
   
   writeTag: function(message) {
     // write the record to the tag:
     nfc.write(
       message,       // write the record itself to the tag
       function () {     // when complete, run this callback function:
         app.display("Wrote data to tag.");   // write to the message div
       },
       // this function runs if the write command fails:
       function (reason) {
         alert("There was a problem " + reason);
       }
     );
   }
};    // end of app
