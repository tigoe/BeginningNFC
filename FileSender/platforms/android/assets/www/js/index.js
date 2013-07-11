
var app = {
    mode: 'write',  // the tag read/write mode
    filePath: '',   // path to your music
    content: '',


    /*
        Application constructor
    */
    initialize: function() {
        this.bindEvents();
        console.log("Starting File Sender app");
    },

    /*
        binds events that are required on startup to listeners.
    */
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        checkbox.addEventListener('change', app.onChange, false);
    },
    /*
         runs when the device is ready for user interaction.
    */
    onDeviceReady: function() {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.onFileSystemSuccess, app.fail);
        // beam API is failing with URLs that contain spaces
        window.resolveLocalFileSystemURI("file:///sdcard/myMusic/test.mp3", app.onResolveSuccess, app.fail);
    },

    onFileSystemSuccess: function (fileSystem) {
        console.log("================");
        console.log(fileSystem.name);
        console.log(fileSystem.root.name);
    },

     onResolveSuccess: function (fileEntry) {
        console.log("-----------------");
        console.log(fileEntry.fullPath);
        app.display(fileEntry.fullPath);
        app.filePath = fileEntry.fullPath;

        fileEntry.getMetadata(function(meta) { // more callbacks
            var info = JSON.stringify(meta);
            console.log(info);
            app.display(info);
        });
    },

    fail: function (evt) {
        console.log(evt.target.error.code);
    },

    shareMessage: function () {

        app.clear();
        app.display("Beaming " + app.filePath);

        // beam the file:
        nfc.handover(
            app.filePath,              
            function () {               // success callback
                navigator.notification.vibrate(100);
                app.clear();
                // we know when the beam is sent and the other device received 
                // the request but we don't know if the beam completes or fails
                app.display("Success! Beam sent.");

            }, function (reason) {      // failure callback
                app.clear();
                app.display("Failed to share file " + reason);
            }
        );
    },

    unshareMessage: function () {

        // stop beaming:
        nfc.stopHandover(
            function () {                           // success callback
                navigator.notification.vibrate(100);
                app.clear();
                app.display("File is no longer shared");
            }, function (reason) {                  // failure callback
                app.clear();
                app.display("Failed to unshare file " + reason);
            });
    },

    /*
        enables or disables sharing, with the checkbox
    */
    onChange: function (e) {
        if (e.target.checked) {         // if the checkbox is checked
            app.shareMessage();         // share the record
        } else {
            app.unshareMessage();       // don't share
        }
    },

    /*
        appends @message to the message div:
    */
    display: function(message) {
        var display = document.getElementById("message"),   // the div you'll write to
            label,                                          // what you'll write to the div
            lineBreak = document.createElement("br");       // a line break

        label = document.createTextNode(message);       // create the label
        display.appendChild(lineBreak);                 // add a line break
        display.appendChild(label);                     // add the message node
    },

    /*
        clears the message div:
    */
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }

};          // end of app
