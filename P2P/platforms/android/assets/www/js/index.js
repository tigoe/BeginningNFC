var data = [
    {
        mimeType: 'text/pg',
        payload: 'Hello PhoneGap'
    },
    {
        mimeType: 'game/rockpaperscissors',
        payload: 'Rock'
    },
    {
        mimeType: 'text/x-vCard',
        payload: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Coleman;Don;;;\n' +
            'FN:Don Coleman\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:215-358-1780\n' +
            'EMAIL;WORK:dcoleman@chariotsolutions.com\n' +
            'END:VCARD'
    },
    {
        mimeType: '',
        payload: ''
    }
];

var index = 0;

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
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        app.clear();
        app.display("Starting P2P App.");
		// listen for change on the checkbox and sample box:
		document.getElementById('checkbox').addEventListener("change", app.onChange, false);
		document.getElementById('sample').addEventListener("click", app.showSampleData, false);
	},
    
   
	unshareTag: function () {
	    // enable user interface:
	    app.enableUI();
		// stop sharing this tag:
	    nfc.unshare(
	        function () {
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("Tag is no longer shared");
	        }, function (reason) {
	            app.clear();
	            app.display("Failed to unshare tag " + reason);
	        });
	},

	shareTag: function () {
		// get the mimeType, and payload from the form and create a new record:
	    var mimeType = document.forms[0].elements.mimeType.value,
	        payload = document.forms[0].elements.payload.value,
	        record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
		// disable typing and clicking:
	    app.disableUI();
	    
		// share the record:
	    nfc.share(
	        [record],
	        function () {
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("Sharing Tag");
	        }, function (reason) {
	        	app.clear()
	            app.display("Failed to share tag " + reason);
	            // when NDEF_PUSH_DISABLED, open setting and enable Android Beam
	        });
	},
	
	disableUI: function() {
	    document.forms[0].elements.mimeType.disabled = true;    
	    document.forms[0].elements.payload.disabled = true;    
	},
	
	enableUI: function () {
	    document.forms[0].elements.mimeType.disabled = false;    
	    document.forms[0].elements.payload.disabled = false;    
	},
	
	onChange: function (e) {
	    if (e.target.checked) {
	        app.shareTag();
	    } else {
	        app.unshareTag();
	    }
	},
	
	showSampleData: function() {
	    var mimeTypeField = document.forms[0].elements.mimeType,
	      payloadField = document.forms[0].elements.payload,
	      record = data[index];
	
	    if (mimeTypeField.disabled) {
	        app.display("Unshare Tag to edit data");
	        return false;
	    }
	    
	    index++;
	    if (index >= data.length) {
	        index = 0;
	    }
	    
	    mimeTypeField.value = record.mimeType;
	    payloadField.value = record.payload;
	    return false;    
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
