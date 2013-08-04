var app = {
/*
   Application constructor
*/
   initialize: function() {
      this.bindEvents();
      console.log("Starting Locator app");
   },
/*
   bind any events that are required on startup to listeners:
*/
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      locatorButton.addEventListener('touchstart', app.toggleLocator, false);
   },

/*
   this runs when the device is ready for user interaction:
*/
   onDeviceReady: function() {
      app.display("Click start to start location service.");
   },

   watchLocation: function() {
     
       // onSuccess Callback
       //   This method accepts a `Position` object, which contains
       //   the current GPS coordinates
       //
       function onSuccess(position) {
           app.clear();
           app.display('Latitude: '  + position.coords.latitude);
           app.display('Longitude: ' + position.coords.longitude);
           app.display(new Date().toString());                      
       }

       // onError Callback receives a PositionError object
       //
       function onError(error) {
           app.display(error.message);
       }

       // Options: throw an error if no update is received every 30 seconds.
       //
       app.watchId = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000,  enableHighAccuracy: true });  
   },
   
   watchId: null,

/*
   turns on or off the locator:
*/
   toggleLocator: function() {
      if (app.watchId === null) {
         app.watchLocation();
         document.getElementById("locatorButton").innerHTML = "Stop";

      } else {
         navigator.geolocation.clearWatch(app.watchId);
         app.clear();
         document.getElementById("locatorButton").innerHTML = "Start";
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