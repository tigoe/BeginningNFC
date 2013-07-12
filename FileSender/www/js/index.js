var app = {
   /*
   Application constructor
   */
   initialize: function() {
      this.bindEvents();
      console.log("Starting File Sender app");
   },
   
   /*
   binds events that are required on startup to listeners.
   */
   bindEvents: function() {
      // bind events to the UI elements:
      document.addEventListener('deviceready', this.onDeviceReady, false);
      checkbox.addEventListener('change', app.onChange, false);
      cameraButton.addEventListener('touchstart', app.takePicture, false);
      filePicker.addEventListener('touchstart', app.chooseFile, false);
   },
   
   /*
   runs when the device is ready for user interaction.
   */
   onDeviceReady: function() {
   
   },
   /*
   brings up the file chooser UI:
   */   
   chooseFile: function() {
      fileChooser.open(
         app.onFileSystemSuccess,   // success handler
         app.failure                // failure handler
      );
   },
   
   /*
   Brings up the camera app:
   */
   takePicture: function () {
      navigator.camera.getPicture(
         app.onCameraSuccess,     // camera capture success handler
         app.failure,             // failure handler
         {                        // set the image settings:
            quality : 75,
            destinationType : Camera.DestinationType.FILE_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
         }
      );
   },
   
   /*
   When you get a good picture, share it:
   */
   onCameraSuccess: function (imageURI) {
      var img = document.createElement("img");   // make a new image
      img.src = imageURI;                        // add the URI
      photoDiv.appendChild(img);                 // add to the photoDiv
      app.display(imageURI);
      app.shareMessage(imageURI);
   },
   
   /*
   When you get a good file, share it:
   */
   onFileSystemSuccess: function (fileURI) {
      app.display(fileURI);
      app.shareMessage(fileURI); 
   },
   
   /*
   When you fail to get a file or photo, cry:
   */
   failure: function (evt) {
      console.log(evt.target.error.code);
   },
   
   /*
   Share the URI from the file or photo via P2P:
   */
   shareMessage: function (uri) {
      // Android Beam API has a bug that prevents sending files
      // with spaces in the URI:
      if (uri.search("%20") > 0) {
         app.clear();
         app.display("Sorry. Can't beam a URI with spaces. Android Beam Bug");
         return;   
      }
      
      app.clear();
      app.display("Ready to beam " + uri);
      // beam the file:
      nfc.handover(
         uri,       
         function () {                // success callback
            navigator.notification.vibrate(100);
            // you know when the beam is sent and the other device received 
            // the request but you don't know if the beam completes or fails
            app.display("Success! Beam sent.");
            app.unshareMessage();       // unshare the file when complete
            checkbox.checked = false;   // turn off the checkbox
         }, 
         function (reason) {       // failure callback
            app.clear();
            app.display("Failed to share file " + reason);
         }
      );
   },
   
   /*
   Turns off sharing
   */ 
   unshareMessage: function () {
      // stop beaming:
      nfc.stopHandover(
         function () {                  // success callback
            navigator.notification.vibrate(100);
            app.clear();
            app.display("File is no longer shared");
         }, 
         function (reason) {         // failure callback
            app.clear();
            app.display("Failed to unshare file " + reason);
         }
      );
   },
   
   /*
   enables or disables sharing, with the checkbox
   */
   onChange: function (e) {
      if (e.target.checked) {     // if the checkbox is checked
         app.shareMessage();       // share the record
      } else {
         app.unshareMessage();     // don't share
      }
   },
   
   /*
   appends @message to the message div:
   */
   display: function(message) {
      var label = document.createTextNode(message),
      lineBreak = document.createElement("br");
      messageDiv.appendChild(lineBreak);      // add a line break
      messageDiv.appendChild(label);          // add the text
   },
   
   /*
   clears the message div:
   */
   clear: function() {
      messageDiv.innerHTML = "";
   }
};     // end of app
