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
        /*
        nfc.addTagDiscoveredListener(
            app.onNfc,                                  // tag successfully scanned
            app.display("NFC initialized"),             // NFC successfully initialized
            app.display("NFC failed to initialize")     // Failed to initialize NFC
        );
        */
         nfc.addNdefListener(
            app.onNfc,                                  // tag successfully scanned
            app.display("Listening for NDEF tags."),    // listener successfully initialized
            app.display("NDEF failed to initialize")    // listener fails to initialize
        );
    },

    onNfc: function(nfcEvent) {
        // variables for this function:
        var tag = nfcEvent.tag,                                // the tag object
            messageDiv = document.getElementById("message"),   // display header
            bodyDiv = document.getElementById("display"),      // display body
            thisElement;                                       // for creating new DOM elements

        // clear the display
        app.clearDisplay();

        // add a paragaph to the display header with the tag ID:
        thisElement = document.createElement("p");
        thisElement.innerHTML = "Tag ID: " + nfc.bytesToHexString(tag.id);
        messageDiv.appendChild(thisElement);

        // get the NDEF message as an array of NDEF records:
        var records = tag.ndefMessage || [];
        // give info about the length of the NDEF message:
        var displayString = "Scanned an NDEF tag with "
            + records.length + " record"
            + ((records.length === 1) ? "": "s");   // if more than one record, pluralize "record"

        // create a paragraph to the body div to display the above info:
        thisElement = document.createElement("p");
        thisElement.innerHTML = displayString;
        bodyDiv.appendChild(thisElement);

        // add a definition list to the body div:
        var properties = document.createElement("dl");
        bodyDiv.appendChild(properties);

        // show the properties of the tag in the definition list:
        if (device.platform.match(/Android/i)) {
            if (tag.id) {
                app.showProperty(properties, "Id", nfc.bytesToHexString(tag.id));
            }
            app.showProperty(properties, "Tag Type", tag.type);
            app.showProperty(properties, "Max Size", tag.maxSize + " bytes");
            app.showProperty(properties, "Is Writable", tag.isWritable);
            app.showProperty(properties, "Can Make Read Only", tag.canMakeReadOnly);
        }

        // Display Record Info
        for (var i = 0; i < records.length; i++) {
            var record = records[i],
            p = document.createElement('p');
            p.innerHTML = app.formatRecord(record);
            bodyDiv.appendChild(p);
        }

        navigator.notification.vibrate(100);
    },

    // Update DOM on a Received Event:
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    /*
        format NDEF records for HTML display
        returns an HTML string
    */
    formatRecord: function(record) {
        var id = "",
            tnf = app.tnfToString(record.tnf),
            recordType = nfc.bytesToString(record.type),
            payload;

        if (record.id && (record.id.length > 0)) {
            id = "Record Id: <b>" + record.id + "<\/b><br/>";
        }

        if (recordType === "T") {
            var langCodeLength = record.payload[0],
            text = record.payload.slice((1 + langCodeLength), record.payload.length);
            payload = nfc.bytesToString(text);

        } else if (recordType === "U") {
            var url =  nfc.bytesToString(record.payload);
            payload = "<a href='" + url + "'>" + url + "<\/a>";

        } else {
            // attempt display as a string
            payload = nfc.bytesToString(record.payload);

        }

        return (id + "TNF: <b>" + tnf + "<\/b><br/>" +
        "Record Type: <b>" + recordType + "<\/b>" +
        "<br/>" + payload
        );
    },

    display: function(message) {
        document.getElementById("message").innerHTML = message;
    },

    /*
        add elements to a definition list.
        Parameters: parent DL element, name for DT, value for DD
    */
    showProperty: function(parent, name, value) {
        var dt, dd;
        dt = document.createElement("dt");
        dt.innerHTML = name;
        dd = document.createElement("dd");
        dd.innerHTML = value;
        parent.appendChild(dt);
        parent.appendChild(dd);
    },

    // clear the message and display divs:
    clearDisplay: function() {
        document.getElementById("message").innerHTML = "";
        document.getElementById("display").innerHTML = "";
    },

    /*
        convert TNF values to their descriptive names.
        returns a string
    */
    tnfToString: function(tnf) {
        var value = tnf;

        switch (tnf) {
        case ndef.TNF_EMPTY:
            value = "Empty";
            break;
        case ndef.TNF_WELL_KNOWN:
            value = "Well Known";
            break;
        case ndef.TNF_MIME_MEDIA:
            value = "Mime Media";
            break;
        case ndef.TNF_ABSOLUTE_URI:
            value = "Absolute URI";
            break;
        case ndef.TNF_EXTERNAL_TYPE:
            value = "External";
            break;
        case ndef.TNF_UNKNOWN:
            value = "Unknown";
            break;
        case ndef.TNF_UNCHANGED:
            value = "Unchanged";
            break;
        case ndef.TNF_RESERVED:
            value = "Reserved";
            break;
        }
        return value;
    }
}
