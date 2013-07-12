var app = {
   hueDeviceType: "NFC Switch",
   hueUserName: "54658242a37981b1dd446c1656469853",
   hueAddress: null,      
   lightId: 1, // should be user configurable
   mimeType: 'text/hue',
   initialize: function() {
      this.bindEvents();
      app.findControllerAddress();      
   },
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
   },
   onDeviceReady: function() {
      app.ensureAuthorized();
      onLabel.addEventListener('touchstart', app.lightOn, false);
      offLabel.addEventListener('touchstart', app.lightOff, false);
      
      nfc.addMimeTypeListener(
         app.mimeType,
         app.onNfc, 
         function() { console.log("listening for mime media tags"); },
         function(error) { console.log("ERROR: " + JSON.stringify(error)); }
         );
   },
   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag,
         records = tag.ndefMessage,
         settings;
                 
      // tag should be TNF_MIME_MEDIA with a type 'text/hue'
      // assume we get a JSON object as the payload
      // JSON object should have valid settings info for the hue
      // http://developers.meethue.com/1_lightsapi.html
      // { "on": true }
      // { "on": false }      
      
      settings = nfc.bytesToString(records[0].payload);
      console.log(settings);
      settings = JSON.parse(settings); // don't really need to parse
      app.hue(settings);      
   },
   hue: function(settings) {
      
      // TODO - consider if the light is on, turn off
      // if the light is on, send the settings
      // possibly add a custom "toggle" tag
      
      $.ajax({ 
         type: 'PUT',
         url: 'http://' + app.hueAddress + '/api/' + app.hueUserName + '/lights/' + app.lightId + '/state',
         data: JSON.stringify(settings),
         success: function(data){
            console.log(JSON.stringify(data));
            if (data[0].error) {
               navigator.notification.alert(JSON.stringify(data), null, "API Error");               
            }
         },
         error: function(xhr, type){
            navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
         }
      });
   },
   findControllerAddress: function() {
      
      $.ajax({
         url: 'http://www.meethue.com/api/nupnp',
         dataType: 'json',
         success: function(data) {
            // expecting a list
            if (data[0]) {
               app.hueAddress = data[0].internalipaddress;
               console.log(app.hueAddress);
            }
         },
         error: function(xhr, type){
            navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
         }
      });
   },
   ensureAuthorized: function() {
      
      var message;
      
      $.ajax({ 
         type: 'GET',
         url: 'http://' + app.hueAddress + '/api/' + app.hueUserName,
         success: function(data){
            if (data[0].error) {
               // if not authorized, users gets an alert box
               if (data[0].error.type === 1) {
                  message = "Press link button on the hub.";
               } else {
                  message = data[0].error.description;
               }
               navigator.notification.alert(message, app.authorize, "Not Authorized");
            }   
         },
         error: function(xhr, type){
            navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
         }
      });               
   },   
   authorize: function() { // could probably be combined with ensureAuthorized
      
      var data = { "devicetype": app.hueDeviceType, "username": app.hueUserName },
         message;
      
      $.ajax({ 
         type: 'POST',
         url: 'http://' + app.hueAddress + '/api',
         data: JSON.stringify(data),
         success: function(data){
            if (data[0].error) {
               // if not authorized, users gets an alert box
               if (data[0].error.type === 101) {
                  message = "Press link button on the hub.";
               } else {
                  message = data[0].error.description;
               }
               navigator.notification.alert(message, app.authorize, "Not Authorized");
            }   
         },
         error: function(xhr, type){
            navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
         }
      });               
   },
   lightOn: function() {
      app.hue( { "on": true } );
   },
   lightOff: function() {
      app.hue( { "on": false } );      
   }      
};
