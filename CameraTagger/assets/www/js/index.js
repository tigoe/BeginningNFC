var app = {

    pictureSource: null,
    destinationType: null,

    // Application constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting NDEF Events app");
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // this runs when the device is ready for user interaction:
    onDeviceReady: function() {
        var parentElement = document.getElementById("message");
        parentElement.innerHTML = "Tap a tag to read its id number.";

        nfc.addMimeTypeListener(
            "text/plain",
            app.onNfc,                                  // tag successfully scanned
            function (status) {                         // listener successfully initialized
                app.display("Listening for MIME Types.");
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );

         app.pictureSource = navigator.camera.PictureSourceType;
         app.destinationType = navigator.camera.DestinationType;
    },

    onNfc: function(nfcEvent) {
        app.clear();                                     // clear the message div
        app.display(" Event Type: " + nfcEvent.type);    // display the event type
        app.capturePhoto();
    },

    capturePhoto: function() {
      // Take picture using device camera and retrieve image as base64-encoded string
      navigator.camera.getPicture(
        app.onPhotoDataSuccess,
        function (status) {                         // camera failure
                app.display("Camera failed.");
        },
        {   quality: 50,
            destinationType: app.destinationType.DATA_URL
        });
    },

    onPhotoDataSuccess: function(imageData) {
      // Uncomment to view the base64 encoded image data
      // console.log(imageData);

      // Get image handle
      //
      var smallImage = document.getElementById('smallImage');

      // Unhide image elements
      //
      smallImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      smallImage.src = "data:image/jpeg;base64," + imageData;
    },

/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"),   // the div you'll write to
            label,                                          // what you'll write to the div
            lineBreak = document.createElement("br");       // a line break

        label = document.createTextNode(message);           // create the label
        display.appendChild(lineBreak);                     // add a line break
        display.appendChild(label);                         // add the message node
    }
};          // end of app
