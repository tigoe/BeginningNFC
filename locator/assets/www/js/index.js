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
    locatorTimer: null,          // variable to hold an locator timer when it's running

    // Application constructor
    initialize: function() {
        this.bindEvents();
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // this runs when the device is ready for user interaction:
    onDeviceReady: function() {
        var parentElement = document.getElementById("location");
        parentElement.innerHTML = "Click to start location service.";
    },

    getLocation: function() {
        // this function is run if the getCurrentPosition is successful:
        var success = function(here) {
            app.update("location", here.coords);
        };
        // this function is run if getCurrentPosition fails:
        var failure = function() {
            app.update("location", null)
        };
        // attempt to get the current position:
        navigator.geolocation.getCurrentPosition(success, failure);
    },

    // Update location element on an update Event:
    update: function(id, location) {
        var parentElement = document.getElementById(id),    // the location div
            thisElement;                                    // used to add to location

        parentElement.innerHTML = "";                       // clear the location div

        // if you got a location, write its lat and long
        // to the location div in two paragraphs:
        if (location != null) {
             thisElement = document.createElement("p");
            thisElement.innerHTML =  "Latitude: " + location.latitude;
            parentElement.appendChild(thisElement);
            thisElement = document.createElement("p");
            thisElement.innerHTML =  "Longitude: " + location.longitude;
            parentElement.appendChild(thisElement);

        // if you got no result, write that to the location div:
        } else {
            parentElement.innerHTML = "No location found";
        }
    },

    locatorTimer: null,          // variable to hold an locator timer when it's running

    toggleLocator: function() {
        // if the timer variable's empty, start it running:
        if (app.locatorTimer == null) {
            app.locatorTimer = setInterval(app.getLocation, 1000);
            // ... and change the label of the button:
            document.getElementById("locatorButton").innerHTML = "Stop";

        // if the timer's running, clear it:
        } else {
            clearInterval(app.locatorTimer);
            app.locatorTimer = null;         // set the timer variable to null
            // ... and change the label of the button:
            document.getElementById("locatorButton").innerHTML = "Start";
        }
    }
};          // close of the app
