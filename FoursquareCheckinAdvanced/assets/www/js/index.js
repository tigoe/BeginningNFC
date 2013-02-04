/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 /*

    UNFINISHED!26 Jan 2013 -Tom Igoe
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        nfc.addTagDiscoveredListener(
                app.onNfc,                      // tag successfully scanned
                app.display("NFC initialized"), // NFC successfully initialized
                app.display                     // Failed to initialize NFC
            );
    },
     display: function(message) {
            document.getElementById("message").innerHTML = message;
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    onNfc: function(nfcEvent) {
        var tag = nfcEvent.tag;
        app.display("Read tag: " + nfc.bytesToHexString(tag.id));
    },

    writeTag: function() {
    	console.log('write tag');
    	var tnf = parseInt(document.forms[0].elements["tnf"].value),
    		recordType = document.forms[0].elements["recordType"].value,
    		payload = nfc.stringToBytes(document.forms[0].elements["payload"].value),
    		record;
    	
    		console.log("tnf: " + tnf + "  record type: " + recordType + "   payload: " + payload);
    		
    	switch (tnf) {
	    	case ndef.TNF_WELL_KNOWN:
	    		record = ndef.record(ndef.TNF_EXTERNAL_TYPE, nfc.stringToBytes(recordType), [], payload);
	    		console.log("Well Known record.");
	    		break;
	    	case ndef.TNF_MIME_MEDIA:
	    		record = ndef.mimeMediaRecord(recordType, payload);
	    		console.log("MIME record.");
	    		break;
	    	case ndef.TNF_ABSOLUTE_URI:
		    	payload.unshift(0x03);           // add URL shortener code
	    	    record = Ndef.uriRecord(payload);
	    	    console.log("URI record");
	    		break;
	    	case ndef.TNF_EXTERNAL_TYPE:
	    	 	record = ndef.record(ndef.TNF_EXTERNAL_TYPE, nfc.stringToBytes(recordType), [], payload);
	    		console.log("External record");
	    		break;
	    }
	    
	    console.log("record is type: " + tnf);
	    	
       // Put together the pieces for the NDEF record:
       // var recordType = nfc.stringToBytes("android.com:pkg");				// record type: android application record
       // var payload = nfc.stringToBytes("com.joelapenna.foursquared");		// application name
       // create the actual NDEF record:
       //  var record = ndef.record(ndef.TNF_EXTERNAL_TYPE, recordType, [], payload);	

        // write the record to the tag:
        nfc.write(
            [record],									// write the record itself to the tag
            function () {								// when complete, run this callback function:
                app.display("Wrote data to tag.");		// notify the user in text on the screen
                navigator.notification.vibrate(100);	// vibrate the device as well
            },
            function (reason) {							// this function runs if the write command fails
                navigator.notification.alert(reason, function() {}, "There was a problem");
            }
        );
    }
};
