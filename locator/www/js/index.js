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
      app.display("Click to start location service.");
   },

/*
   Displays the current position in the message div:
*/
   getLocation: function() {
      // this function is run if the getCurrentPosition is successful:
      var success = function(here) {
         var location = here.coords;   // get the coordinates
         app.clear();                  // clear the messave div

         // show the location in the message div
         app.display("Latitude: " + location.latitude);
         app.display("Longitude: " + location.longitude);
      };

      // this function is run if getCurrentPosition fails:
      var failure = function() {
         app.clear();                        // clear the messave div
         app.display("No location found");   // display failure message
      };

      // attempt to get the current position:
      navigator.geolocation.getCurrentPosition(success, failure);
   },

   locatorTimer: null,   // variable to hold a locator timer when it's running

/*
   turns on or off the locator:
*/
   toggleLocator: function() {
      // if the timer variable's empty, start it running:
      if (app.locatorTimer == null) {
         // set an inteval of 1 second (1000 ms):
         app.locatorTimer = setInterval(app.getLocation, 1000);
         // ... and change the label of the button:
         document.getElementById("locatorButton").innerHTML = "Stop";

      // if the timer's running, clear it:
      } else {
         clearInterval(app.locatorTimer);
         app.locatorTimer = null;       // set the timer variable to null
         // ... and change the label of the button:
         document.getElementById("locatorButton").innerHTML = "Start";
      }
   },
/*
   appends @message to the message div:
*/
   display: function(message) {
      var display = document.getElementById("message"), // the message div
         lineBreak = document.createElement("br"),      // a line break
         label = document.createTextNode(message);      // create the label

      display.appendChild(lineBreak);            // add a line break
      display.appendChild(label);                // add the message node
   },
/*
   clears the message div:
*/
   clear: function() {
      var display = document.getElementById("message");
      display.innerHTML = "";
   }
};     // end of app