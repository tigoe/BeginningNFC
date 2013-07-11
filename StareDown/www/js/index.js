
var app = {
	shareCount: 0,
		
    /*
        Application constructor
     */
    initialize: function() {
        this.bindEvents();
        console.log("Starting P2P Staredown app");
    },
    /*
        bind any events that are required on startup to listeners:
    */
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        start.addEventListener('touchend', app.shareMessage, false);
    },
    
    /*
        this runs when the device is ready for user interaction:
    */
    onDeviceReady: function() {
        app.clear();
        app.display("Starting P2P App.");
        
         nfc.addNdefListener(
            app.onNfc,                   // nfcEvent received
            function (status) {          // listener successfully initialized
                app.display("Listening for NDEF messages.");
            },
            function (error) {           // listener fails to initialize
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
    		message = tag.ndefMessage, 
    		record, 
    		content;
        console.log("Got a message");
        if (message !== null) {    
        	record = message[0];
        	console.log("message isn't empty");
        	content = nfc.bytesToString(record.payload);
        	console.log("Payload: " + content);
        	if (isNaN(parseFloat(content))) {
	        	app.clear();
	        	app.display(content);
        	} else {
				remoteScore = content;
			}
			
			app.unshareMessage();
        }    
    },
        
    shareMessage: function () {
    	sharingStatus.innerHTML = "Attempting to share";
        // get the mimeType, and payload from the form and create a new record:
        var mimeType = "text/plain",
            payload = app.shareCount.toString(),
            record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
         
        // share the message:
        nfc.share(
            [record],                    // NDEF message to share
            function () {                // success callback
                navigator.notification.vibrate(100);
                 app.shareCount++;
                 console.log("Success! Shared message");
                localScore.innerHTML = app.shareCount.toString();
                app.unshareMessage();
                
            }, function (reason) {        // failure callback
                app.clear();
                app.display("Failed to share message " + reason);
            });
    },
    
    unshareMessage: function () {
        // stop sharing this message:
        sharingStatus.innerHTML = "Not sharing";
        nfc.unshare(
            function () {                            // success callback
                navigator.notification.vibrate(100);
                app.clear();
                app.display("message is no longer shared");
            }, function (reason) {                    // failure callback
                app.clear();
                app.display("Failed to unshare message " + reason);
            });
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
    },
    /*
        clears the message div:
    */
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app
