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
    accelerometerTimer: null,

    lastReading: {},


    // getAcceleration: function() {
    //     // this function is run if the getCurrentPosition is successful:
    //     var success = function(acceleration) {
    //         app.clear();                            // clear the screen
    //         app.display("X: " + Math.round(acceleration.x));   // show the current X value
    //         app.display("Y: " + Math.round(acceleration.y));   // show the current Y value
    //         app.display("Z: " + Math.round(acceleration.z));   // show the current X value

    //         // get the differences between the current and the last:
    //         var diffX = app.lastReading.x - acceleration.x,
    //             diffY = app.lastReading.y - acceleration.y,
    //             diffZ = app.lastReading.z - acceleration.z;

    //         // if there's a significant difference on any channel, notify the user:
    //         if (Math.abs(diffX) > 9) {
    //             app.bump(diffX);
    //         }
    //         if (Math.abs(diffY) > 9) {
    //             app.bump(diffY);
    //         }
    //         if (Math.abs(diffZ) > 9) {
    //             app.bump(diffZ);
    //         }

    //         // save the current reading as the last:
    //         app.lastReading = acceleration;
    //     };

    //     // this function is run if getCurrentPosition fails:
    //     var failure = function(error) {
    //         app.display("accelerometer failure ("
    //                          + error.name + ": "
    //                          + error.message + ")");        };

    //     // attempt to get the current position:
    //     navigator.accelerometer.getCurrentAcceleration(success, failure)
    // },


    bump: function(value) {
        app.display("Bump " + value);
    },


    // toggleAccelerometer: function() {
    //     // if the timer variable's empty, start it running:
    //     if (app.accelerometerTimer === null) {
    //         // set an inteval of 1 second (1000 ms):
    //         app.accelerometerTimer = setInterval(app.getAcceleration, 100);
    //         // ... and change the label of the button:
    //         document.getElementById("accelerometer").innerHTML = "Stop";

    //     // if the timer's running, clear it:
    //     } else {
    //         clearInterval(app.accelerometerTimer);
    //         app.accelerometerTimer = null;         // set the timer variable to null
    //         // ... and change the label of the button:
    //         document.getElementById("accelerometer").innerHTML = "Start";
    //     }
    // },

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
            app.bump(diffX);
        }
        if (Math.abs(diffY) > 9) {
            app.bump(diffY);
        }
        if (Math.abs(diffZ) > 9) {
            app.bump(diffZ);
        }

        // save the current reading as the last:
        app.lastReading = a;
    },



    toggleAccelerometer: function() {
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
