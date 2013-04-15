/*
    TODO:
        Add file picker to replace songPicker DOM element
        Add write/listen modes
        Test NFC Writing and reading
*/


var app = {
    // parameters for hue:
    hueDeviceType: "NFC Switch",
    hueUserName: "thomaspatrickigoe",
    hueAddress: null,
    lightId: 1,
    mimeType: 'text/hue',
    lights: {},

    // parameters for audio playback:
    currentSong: null,
    songTitle: null,

/*
    Application constructor
*/
    initialize: function() {
        this.bindEvents();
        console.log("Starting Mood Setter app");
        app.findControllerAddress();
    },

    // bind any events that are required on startup to listeners:
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        bri.addEventListener('touchend', app.setBrightness, false);
        hue.addEventListener('touchend', app.setHue, false);
        sat.addEventListener('touchend', app.setSaturation, false);
        tagWriterButton.addEventListener('touchstart', app.makeMessage, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },
/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        app.songTitle = songName.value;
        app.clear();
        app.display("Tap a tag to play its song and set the lights.");

        nfc.addNdefListener(
            app.onNfc,                                  // tag successfully scanned
            function (status) {                         // listener successfully initialized
                app.display("Listening for NDEF tags.");
            },
            function (error) {                          // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
        );

        nfc.addMimeTypeListener(
            app.mimeType,
            app.onNfc,
            function() { console.log("listening for mime media tags"); },
            function(error) { console.log("ERROR: " + JSON.stringify(error)); }
        );
    },

/*
    This is called when the app is paused
*/
    onPause: function() {
        app.pauseAudio();
    },

/*
    This is called when the app is resumed
*/
    onResume: function() {
        app.playAudio();
    },

/*
    runs when an NDEF-formatted tag shows up.
*/
    onNfc: function(nfcEvent) {
        var tag = nfcEvent.tag,
            message = tag.ndefMessage,
            record,
            recordType,
            content;

        for (var thisRecord in message) {
            // get the next record in the message array:
            record = message[thisRecord];
            // parse the record:
            recordType = nfc.bytesToString(record.type);

            // if you've got a URI, use it to start a song:
            if (recordType === nfc.bytesToString(ndef.RTD_URI)) {
                // for some reason I have to cut the first byte of the payload
                // in order to get a playable URI:
                var trash = record.payload.shift();
                // convert the remainder of the payload to a string:
                content = nfc.bytesToString(records[0].payload);
                app.stopAudio();            // stop whatever is playing
                app.playAudio(content);     // play the song
            }

            // if you've got a hue JSON object, set the lights:
            if (recordType === 'text/hue') {
                // tag should be TNF_MIME_MEDIA with a type 'text/hue'
                // assume we get a JSON object as the payload
                // JSON object should have valid settings info for the hue
                // http://developers.meethue.com/1_lightsapi.html
                // { "on": true }
                // { "on": false }

                content = nfc.bytesToString(record.payload);
                console.log(content);
                content = JSON.parse(content); // don't really need to parse
                app.hue(content);
            }
        }
    },

    setControls: function() {
        // TO DO: set the controls using the state of the latest picked light:
        app.getHueSettings();
        app.lightId = lightNumber.value;
        bri.value = app.lights[app.lightId].state.bri;
        hue.value = app.lights[app.lightId].state.hue;
        sat.value = app.lights[app.lightId].state.sat;
        lightOn.checked = app.lights[app.lightId].state.on;
    },

    setBrightness: function() {
        var brightnessValue = parseInt(bri.value);
        app.hue( { "bri": brightnessValue } );
    },

    setHue: function() {
        var hueValue = parseInt(hue.value);
        app.hue( { "hue": hueValue } );
    },

    setSaturation: function() {
        var saturationValue = parseInt(sat.value);
        app.hue( { "sat": saturationValue } );
    },

    lightState: function() {
        console.log(lightOn.checked);
        var onValue = lightOn.checked;
        app.hue( { "on": onValue } );
    },

    getHueSettings: function() {
        // query the hub and get its current settings:
        var url = 'http://' + app.hueAddress + '/api/' + app.hueUserName;
        console.log(url);

        $.get(url, function(data) {
            app.lights = data.lights;
            // set the names of the lights in the dropdown menu:
            // TODO: Generalize this for more than three lights:
            lightNumber.options[0].innerHTML = app.lights["1"].name;
            lightNumber.options[1].innerHTML = app.lights["2"].name;
            lightNumber.options[2].innerHTML = app.lights["3"].name;
        });
    },

    hue: function(settings) {

        // TODO - consider if the light is on, turn off
        // if the light is on, send the settings
        // possibly add a custom "toggle" tag

        $.ajax({
            type: 'PUT',
            url: 'http://' + app.hueAddress + '/api/' + app.hueUserName + '/lights/' + app.lightId + '/state',
            data: JSON.stringify(settings),
            success: function(data){
                console.log(JSON.stringify(data));
                if (data[0].error) {
                    navigator.notification.alert(JSON.stringify(data), null, "API Error");
                }
            },
            error: function(xhr, type){
                navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
            }
        });
    },

    findControllerAddress: function() {

        $.ajax({
            url: 'http://www.meethue.com/api/nupnp',
            dataType: 'json',
            success: function(data) {
                // expecting a list
                if (data[0]) {
                    app.hueAddress = data[0].internalipaddress;
                    console.log(app.hueAddress);
                    app.getHueSettings();
                }
            },
            error: function(xhr, type){
                navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
            }
        });
    },

    ensureAuthorized: function() {

        var message;

        $.ajax({
            type: 'GET',
            url: 'http://' + app.hueAddress + '/api/' + app.hueUserName,
            success: function(data){
                if (data[0].error) {
                    // if not authorized, users gets an alert box
                    if (data[0].error.type === 1) {
                        message = "Press link button on the hub.";
                    } else {
                        message = data[0].error.description;
                    }
                    navigator.notification.alert(message, app.authorize, "Not Authorized");
                }
            },
            error: function(xhr, type){
                navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
            }
        });
    },

    authorize: function() { // could probably be combined with ensureAuthorized

        var data = { "devicetype": app.hueDeviceType, "username": app.hueUserName },
            message;

        $.ajax({
            type: 'POST',
            url: 'http://' + app.hueAddress + '/api',
            data: JSON.stringify(data),
            success: function(data){
                if (data[0].error) {
                    // if not authorized, users gets an alert box
                    if (data[0].error.type === 101) {
                        message = "Press link button on the hub.";
                    } else {
                        message = data[0].error.description;
                    }
                    navigator.notification.alert(message, app.authorize, "Not Authorized");
                }
            },
            error: function(xhr, type){
                navigator.notification.alert(xhr.responseText + " (" + xhr.status + ")", null, "Error");
            }
        });
    },

    // Play audio
    playAudio: function(src) {
        if (playButton.innerHTML === "Pause") {
            app.pauseAudio();
        } else if (playButton.innerHTML === "Play") {
            if (app.currentSong === null) {
                // Create Media object from src
                app.currentSong = new Media(src, app.onSuccess, app.onError);
                app.songTitle = src;
            }
            // Play audio
            app.currentSong.play();

            // show the name:
            if (app.songTitle) {
                app.clear();
                app.display("Song: " + app.songTitle);
            }
            playButton.innerHTML = "Pause";
        }
    },

    pauseAudio: function() {
        if (app.currentSong) {
            app.currentSong.pause();
            playButton.innerHTML = "Play";
        }
    },

    stopAudio: function() {
        if (app.currentSong) {
            app.currentSong.stop();
            playButton.innerHTML = "Play";
        }
    },

    onSuccess: function() {
        //console.log("playing audio");
    },

    // onError Callback
    //
    onError: function(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
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
    },

/*
    makes an NDEF message and calls writeTag() to write it to a tag:
*/
    makeMessage: function() {

        // get the current state of the lights:
        app.getHueSettings();

        var lightRecord = ndef.mimeMediaRecord(app.mimeType, app.lights),
            songRecord = ndef.uriRecord(app.songTitle);

        // put the record in the message array:
        message.push(songRecord);
        message.push(lightRecord);

        //write the message:
        app.writeTag(message);
    },

/*
    writes NDEF message @message to a tag:
*/
    writeTag: function(message) {
        // write the record to the tag:
        nfc.write(
            message,						// write the record itself to the tag
            function () {					// when complete, run this callback function:
                app.clear();                            // clear the message div
                app.display("Wrote data to tag.");		// notify the user in message div
                navigator.notification.vibrate(100);	// vibrate the device as well
            },
            function (reason) {				// this function runs if the write command fails
                navigator.notification.alert(reason, function() {}, "There was a problem");
            }
        );
    }
};          // end of app
