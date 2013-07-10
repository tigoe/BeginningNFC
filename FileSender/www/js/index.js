
var app = {
    mode: 'write',                  // the tag read/write mode
    filePath: '',   // path to your music
    content: '',
    
    
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
        document.addEventListener('deviceready', this.onDeviceReady, false);
        checkbox.addEventListener('change', app.onChange, false);
    },
    /*
         runs when the device is ready for user interaction.
    */
    onDeviceReady: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.onFileSystemSuccess, app.fail);	
		window.resolveLocalFileSystemURI("file:///sdcard/myMusic/02 Paranoid.mp3", app.onResolveSuccess, app.fail);
    },
    
    onFileSystemSuccess: function (fileSystem) {
        console.log(fileSystem.name);
        console.log(fileSystem.root.name);
		
    },
    
     onResolveSuccess: function (fileEntry) {
        console.log(fileEntry.name);
        filePath = fileEntry.file;
          console.log(fileEntry.getMetadata);
          app.display(fileEntry.getMetadata);
    },


    fail: function (evt) {
        console.log(evt.target.error.code);
    },
    
      
	shareMessage: function () {
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
};          // end of app
