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
        // ignore what's on the tag for now, just overwrite

        // to be proper, you should use a TYPE_WELL_KNOWN and a URI recordType,
        // with a URL shortener:
        //var payload = nfc.stringToBytes("m.foursquare.com/venue/4a917563f964a520401a20e3");
        // payload.unshift(0x03);           // add URL shortener code
        //var record = ndef.record(ndef.TNF_WELL_KNOWN, ndef.RTD_URI, [], payload);

        // here's how you open a particular venue in Foursquare with a URI record:
        //  var record = Ndef.uriRecord("m.foursquare.com/venue/4a917563f964a520401a20e3");

        // Here's how you open an app on the phone, in this case Foursquare:
        var recordType = nfc.stringToBytes("android.com:pkg");
        var payload = nfc.stringToBytes("com.joelapenna.foursquared");
        var record = ndef.record(ndef.TNF_EXTERNAL_TYPE, recordType, [], payload);

        nfc.write(
            [record],
            function () {
                app.display("Wrote data to tag.");
                navigator.notification.vibrate(100);
            },
            function (reason) {
                navigator.notification.alert(reason, function() {}, "There was a problem");
            }
        );
    }
};
