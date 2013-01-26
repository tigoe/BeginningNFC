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
        var record = ndef.record(ndef.TNF_WELL_KNOWN, ndef.RTD_URI, [], nfc.stringToBytes("http://m.foursquare.com/venue/4a917563f964a520401a20e3"));

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
