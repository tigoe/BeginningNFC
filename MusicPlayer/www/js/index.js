var app = {
/*
   Application constructor
 */
   initialize: function() {
      this.bindEvents();
      console.log("Starting Audio player app");
   },
/*
   bind any events that are required on startup to listeners:
*/
   bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
      document.addEventListener('pause', this.onPause, false);
      document.addEventListener('resume', this.onResume, false);
   },

/*
   This is called when the app is paused
*/
   onPause: function() {
      app.pauseAudio();
   },

/*
   This is called when the app is resumed
*/
   onResume: function() {
      app.playAudio();
   },
/*
   this runs when the device is ready for user interaction:
*/
   onDeviceReady: function() {
      app.clear();
      app.display("Tap a tag to read its song.");

        nfc.addNdefListener(
         app.onNfc,               // tag successfully scanned
         function (status) {        // listener successfully initialized
            app.display("Listening for NDEF messages.");
         },
         function (error) {         // listener fails to initialize
            app.display("NFC reader failed to initialize "
               + JSON.stringify(error));
         }
      );
   },

/*
   displays tag from @nfcEvent in message div:
*/

   onNfc: function(nfcEvent) {
      var tag = nfcEvent.tag,
         thisMessage = tag.ndefMessage,
         messageType,
         content;

      if (thisMessage !== null) {
         // for some reason I have to cut the first byte of the payload
         // in order to get a playable URI:
         var trash = thisMessage[0].payload.shift();
         // convert the remainder of the payload to a string:
         content = nfc.bytesToString(thisMessage[0].payload);
         // get the message type"
         messageType = nfc.bytesToString(thisMessage[0].type);
         // if you've got a URI, use it to start a song:
         if (messageType === nfc.bytesToString(ndef.RTD_URI)) {
            app.stopAudio();         // stop whatever is playing
            app.playAudio(content);    // play the song
         }
      }
   },

   // parameters for audio playback:
   currentSong: null,
   songTitle: null,

   // Play audio
   playAudio: function(src) {
      if (app.currentSong === null) {
         // Create Media object from src

         // not sure why this generates an error alert even though it plays:
         app.currentSong = new Media(src, app.onSuccess, app.onError);
         app.songTitle = src;
      }

      // Play audio
      app.currentSong.play();

      // show the name:
      if (app.songTitle) {
         app.clear();
         app.display("Song: " + app.songTitle);
      }
   },

   resumeAudio: function() {
      if (app.currentSong) {
         app.currentSong.resume();
      }
   },

   pauseAudio: function() {
      if (app.currentSong) {
         app.currentSong.pause();
      }
   },

   stopAudio: function() {
      if (app.currentSong) {
         app.currentSong.stop();
         app.currentSong = null;
      }
   },

   onSuccess: function() {
      console.log("playing audio");
   },

   // onError Callback
   //
   onError: function(error) {
      alert('code: '   + error.code   + '\n' +
           'message: ' + error.message + '\n');
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
