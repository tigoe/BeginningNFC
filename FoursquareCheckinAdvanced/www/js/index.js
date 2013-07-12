 var app = {
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
     writeButton.addEventListener('touchstart', app.makeMessage, false);
   },

   /*
     this runs when the device is ready for user interaction:
   */
   onDeviceReady: function() {
     app.clear();
     app.display("Tap a tag to read its id number.");

     nfc.addTagDiscoveredListener(
       app.onNfc,            // tag successfully scanned
       function (status) {      // listener successfully initialized
         app.display("Listening for NFC tags.");
       },
       function (error) {      // listener fails to initialize
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
   },

   /*
     appends @message to the message div:
   */
   display: function(message) {
     var display = document.getElementById("message"), // the message div
       lineBreak = document.createElement("br"),   // a line break
       label = document.createTextNode(message);   // create the label

     display.appendChild(lineBreak);      // add a line break
     display.appendChild(label);         // add the message node
   },
   
   /*
     clears the message div:
   */
   clear: function() {
     var display = document.getElementById("message");
     display.innerHTML = "";
   },

   makeMessage: function() {
     // get the app type that the user wants to emulate from the HTML form:
     var appType = parseInt(appPicker.value, 10),
       tnf,         // NDEF Type Name Format
       recordType,      // NDEF Record Type
       payload,       // content of the record
       record,        // NDEF record object
       message = [];     // NDEF Message to pass to writeTag()

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
         message.push(record);    // push the record onto the message
         break;
        case 3:      // like NXP TagWriter
          // The payload of a Smart Poster record is an NDEF message
          // so create an array of two records like so:
          var smartPosterPayload = [
            ndef.uriRecord(
              "http://m.foursquare.com/venue/4a917563f964a520401a20e3"),
            ndef.textRecord("foursquare checkin"),
            ndef.record( // Android Application Record
              ndef.TNF_EXTERNAL_TYPE,
              "android.com:pkg", [],
              "com.joelapenna.foursquared"
            )
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
         // this is a long URI, so for formatting's sake, it's broken
         // into four lines. But it's just a string:
         var uri = "tectile://www/samsung.com/us/microsite/error?"
            + "action=foursquare_checkin&"
            + "payload=http://m.foursquare.com/"
            + "venue/4a917563f964a520401a20e3";
         payload = nfc.stringToBytes(uri);
         // URI identifier 0x00 because there's no ID for "tectile://":
         payload.unshift(0x00);
         record = ndef.record(tnf, recordType, [], payload);
         message.push(record);    // push the record onto the message

         // format the Android Application Record:
         tnf = ndef.TNF_EXTERNAL_TYPE;
         recordType = "android.com:pkg";
         payload = "com.samsung.tectile";
         record = ndef.record(tnf, recordType, [], payload);
         message.push(record);    // push the record onto the message
         console.log("External type.");
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
     app.writeTag(message);
   },

   writeTag: function(message) {
     // write the record to the tag:
     nfc.write(
       message,       // write the record itself to the tag
       function () {     // when complete, run this callback function:
         app.clear();   // clear the message div
         app.display("Wrote data to tag.");   // write to the message div
         navigator.notification.vibrate(100); // vibrate the device
       },
       // this function runs if the write command fails:
       function (reason) {
         navigator.notification.alert(reason, function(){},
            "There was a problem");
       }
     );
   }
};    // end of app
