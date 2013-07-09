
var app = {
    mode: 'write',                  // the tag read/write mode
    filePath: 'file:///sdcard/myMusic/',   // path to your music
    content: '',
    
    /*
        Application constructor
    */
    initialize: function() {
        this.bindEvents();
        console.log("Starting Mood Setter app");
    },

    /*
        binds events that are required on startup to listeners.
    */
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        songName.addEventListener('change', app.setSong, false);
        checkbox.addEventListener('change', app.onChange, false);
    },
    /*
         runs when the device is ready for user interaction.
    */
    onDeviceReady: function() {

    },
    
	shareMessage: function () {
		var mimeType = 'audio/mpeg3';
		// get the mimeType, and payload from the form and create a new record:
	        record = ndef.uriRecord(app.filePath);
	       
		// share the message:
	    nfc.share(
	        [record],					// NDEF message to share
	        function () {				// success callback
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("Success!  File shared");
	            
	        }, function (reason) {		// failure callback
	        	app.clear();
	            app.display("Failed to share file " + reason);
	        });
	},
	
	unshareMessage: function () {
		// stop sharing this tag:
	    nfc.unshare(
	        function () {							// success callback
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("File is no longer shared");
	        }, function (reason) {					// failure callback
	            app.clear();
	            app.display("Failed to unshare file " + reason);
	        });
	},
	
	/*
		enables or disables sharing, with the checkbox
	*/
	onChange: function (e) {
	    if (e.target.checked) {			// if the checkbox is checked
	        app.shareMessage();			// share the record
	    } else {
	        app.unshareMessage();		// don't share
	    }
	},

    /*
        appends @message to the message div:
    */
    display: function(message) {
        var display = document.getElementById("message"),   // the div you'll write to
            label,                                          // what you'll write to the div
            lineBreak = document.createElement("br");       // a line break

        label = document.createTextNode(message);       // create the label
        display.appendChild(lineBreak);                 // add a line break
        display.appendChild(label);                     // add the message node
    },

    /*
        clears the message div:
    */
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },

 
    /*
        sets the song name from the HTML file input field.
    */
    setSong: function() {
        // if there's no song title given,
        // check the songName file picker for a title:
        if (typeof(content) !== 'string' ) {
            // get rid of the standard c:\\fakepath beginning
            // that the HTML file input object adds:
            content = songName.value.replace("C:\\fakepath\\", "");
            app.filePath += content;
            console.log(app.filePath);
        }
     }
};          // end of app
