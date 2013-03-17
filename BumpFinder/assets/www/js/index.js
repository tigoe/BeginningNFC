var app = {
    /*
        Application constructor
    */
    initialize: function() {
        this.bindEvents();
        console.log("Starting Bump app");
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
        app.display("Click to start acceleration service.");
    },

    accelerationWatch: null,

    lastReading: {},

    updateAcceleration: function (a) {
        app.clear();                            // clear the screen
        app.display("X: " + Math.round(a.x));   // show the current X value
        app.display("Y: " + Math.round(a.y));   // show the current Y value
        app.display("Z: " + Math.round(a.z));   // show the current X value

        // get the differences between the current and the last:
        var diffX = app.lastReading.x - a.x,
            diffY = app.lastReading.y - a.y,
            diffZ = app.lastReading.z - a.z;

        // if there's a significant difference on any channel, notify the user:
        if (Math.abs(diffX) > 9) {
            app.display("Bump X " + diffX);
        }
        if (Math.abs(diffY) > 9) {
            app.display("Bump Y " + diffY);
        }
        if (Math.abs(diffZ) > 9) {
            app.display("Bump Z " + diffZ);
        }

        // save the current reading as the last:
        app.lastReading = a;
    },

    toggleAcceleration: function() {
        if (app.accelerationWatch !== null) {
            navigator.accelerometer.clearWatch(accelerationWatch);
            updateAcceleration({
                x: "",
                y: "",
                z: ""
            });
            app.accelerationWatch = null;
        } else {
            var options = {};
            options.frequency = 40;
            app.accelerationWatch = navigator.accelerometer.watchAcceleration(
                    app.updateAcceleration,
                    function(error) {
                        app.display("accelerometer failure ("
                            + error.name + ": "
                            + error.message + ")");
                    },
                    options);
        }
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
