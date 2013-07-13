var data = [
      {
         name: "Text Record",
         kind: "text",
         data: "hello, world"
      },
      {
         name: "URI Record",
         kind: "uri",
         data: "http://oreilly.com"
      },
      {
         name: "Address",
         kind: "mime",
         type: 'text/x-vCard',
         data: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Coleman;Don;;;\n' +
            'FN:Don Coleman\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:215-555-1212\n' +
            'EMAIL;WORK:don@example.com\n' +
            'END:VCARD'
      },
      {
         name: "Hue Settings",
         kind: "mime",
         type: 'text/hue',
         data: JSON.stringify({
         "1":
            {"state":
               {"on":true,"bri":65,"hue":44591,"sat":254}
            },
         "2":
            {"state":
               {"on":true,"bri":254,"hue":13122,"sat":211}
            },
         "3":
            {"state":
               {"on":true,"bri":255,"hue":14922,"sat":144}
            }
         })
      },
      {
         name: "Android Application Record",
         kind: "external",
         type: "android.com:pkg",
         data: "com.joelapenna.foursquared"
      },
      {
         name: "Empty",
         kind: "empty",
         data: ""
      }
];

var app = {
   /*
      Application constructor
    */
   initialize: function() {
      this.bindEvents();
      console.log("Starting P2P app");
   },
   /*
      bind any events that are required on startup to listeners:
   */
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      sampleField.addEventListener('change', app.showSampleData, false);
      document.forms[0].onsubmit = function(evt) {
         evt.preventDefault(); // don't submit
         payloadField.focus();
      };
      typeField.onchange = app.shareMessage;
      payloadField.onchange = app.shareMessage;
   },

   /*
      this runs when the device is ready for user interaction:
   */
   onDeviceReady: function() {
      var option;
      app.displayMessage("Starting P2P App.");

      // populate the combo from the data array
      sampleField.innerHTML = "";
      for (var i = 0; i < data.length; i++) {
         option = document.createElement("option");
         option.value = i;
         option.innerHTML = data[i].name;
         if (i === 0) { option.selected = true; }
         sampleField.appendChild(option);
      }

      app.showSampleData();
   },

   shareMessage: function () {

      // get the mimeType, and payload from the form and create a new record:
      var payloadType = typeField.value,
          payloadData = payloadField.value,
          kind = kindField.value,
          record;

      app.displayMessage("Publishing message");

      switch (kind) {
         case "text":
            record = ndef.textRecord(payloadData);
            break;
         case "uri":
            record = ndef.uriRecord(payloadData);
            break;
         case "mime":
            record = ndef.mimeMediaRecord(payloadType, payloadData);
            break;
         case "external":
            record = ndef.record(ndef.TNF_EXTERNAL_TYPE, payloadType, [], payloadData);
            break;
         case "empty":
            record = ndef.emptyRecord();
            break;
         default:
            alert("ERROR: can't build record");
      }

      console.log(JSON.stringify(record));

      // share the message:
      nfc.share(
         [record],                // NDEF message to share
         function () {            // success callback
            navigator.notification.vibrate(100);
            app.displayMessage("Success! Message sent to peer.");
         }, function (reason) {      // failure callback
            app.displayMessage("Failed to share message " + reason);
         });
   },

   unshareMessage: function () {
      // stop sharing this message:
      nfc.unshare(
         function () {                     // success callback
            navigator.notification.vibrate(100);
            app.displayMessage("message is no longer shared");
         }, function (reason) {               // failure callback
            app.displayMessage("Failed to unshare message " + reason);
         });
   },

   /*
      Get data from the data array and put it in the form fields:
   */
   showSampleData: function() {

      // get the type and payload from the form
      var index = sampleField.value,
          record = data[index]; // TODO rename record

      // fill form with the data from the record:
      kindField.value = record.kind;
      typeField.value = record.type;
      payloadField.value = record.data;

      // hide type for kinds that don't need it
      if (typeof record.type === 'string') {
         typeDiv.style.display = "";
      } else {
         typeDiv.style.display = "none";
      }

      app.shareMessage();
   },

   displayMessage: function(message) {
      messageDiv.innerHTML = message;
   }

};     // end of app
