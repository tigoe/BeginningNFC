var data = [
	{	// a text/plain MIME type payload
	     mimeType: 'text/plain',
		 payload: 'Hello world!'
    },
    {	// a text/hue MIME type payload
        mimeType: 'text/hue',
        payload: JSON.stringify({"1":
					{"state":
						{"on":true,"bri":65,"hue":44591,"sat":254}
					},
				"2":
					{"state":
						{"on":true,"bri":254,"hue":13122,"sat":211}
					},
				"3":
					{"state":
						{"on":true,"bri":255,"hue":14922,"sat":144}
					}
				})
    },
    {	// a vCard payload
        mimeType: 'text/x-vCard',
        payload: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Coleman;Don;;;\n' +
            'FN:Don Coleman\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:617-320-0000\n' +
            'EMAIL;WORK:don@example.com\n' +
            'END:VCARD'
    },
    {	// an Android application record
        mimeType: 'text/aar',			
        payload: 'com.joelapenna.foursquared'
    },
                              
    {	// an empty payload
	     mimeType: '',
		 payload: ''
    }
];

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
        sample.addEventListener('change', app.showSampleData, false);
        checkbox.addEventListener("change", app.onChange, false);
    },
	
	/*
	    this runs when the device is ready for user interaction:
	*/
    onDeviceReady: function() {
        app.clear();
        app.display("Starting P2P App.");
	},
    
	shareMessage: function () {
		// get the mimeType, and payload from the form and create a new record:
	    var mimeType = document.forms[0].elements.mimeType.value,
	        payload = document.forms[0].elements.payload.value,
	        record;
	        
			if (mimeType === 'text/aar') {		// format an Android Application Record
                var tnf = ndef.TNF_EXTERNAL_TYPE,
                 	recordType = "android.com:pkg";
                record = ndef.record(tnf, recordType, [], payload);
	        }  else {							// format a MIME media record
	        	record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));
	        }
	    app.setUI(false);			// disable typing and clicking
	    
		// share the message:
	    nfc.share(
	        [record],					// NDEF message to share
	        function () {				// success callback
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("Success!  message shared");
	            
	        }, function (reason) {		// failure callback
	        	app.clear();
	            app.display("Failed to share message " + reason);
	        });
	},
	
	unshareMessage: function () {
	    // enable user interface:
	    app.setUI(true);
		// stop sharing this message:
	    nfc.unshare(
	        function () {							// success callback
	            navigator.notification.vibrate(100);
	            app.clear();
	            app.display("message is no longer shared");
	        }, function (reason) {					// failure callback
	            app.clear();
	            app.display("Failed to unshare message " + reason);
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
		Get data from the data array and put it in the form fields:
	*/
	showSampleData: function() {
		// get the mimeType and payload from the fields
	    var mimeTypeField = document.forms[0].elements.mimeType,
	      payloadField = document.forms[0].elements.payload,
	      index = sample.value,
	      record = data[index];
	
		//if the user wants to edit, she has to uncheck "share message":
	    if (mimeTypeField.disabled) {
		        app.display("Unshare message to edit data");
	        return false;
	    }
	    
	    // fill the field with the data from the record:
	    mimeTypeField.value = record.mimeType;
	    payloadField.value = record.payload;
	    return false;    
	},
	/*
		enable or disable user input:
	*/
	setUI: function(setting) {
	    document.forms[0].elements.mimeType.disabled = setting;    
	    document.forms[0].elements.payload.disabled = setting;    
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
