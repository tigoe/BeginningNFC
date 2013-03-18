var app = {
    hueDeviceType: "NFC Switch",
    hueUserName: "54658242a37981b1dd446c1656469853"
    hueAddress: null,        
    lightId: 1, // should be user configurable
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        findControllerAddress();
        ensureAuthorized();
        
        nfc.addMimeTypeListener(
            "text/hue",
            app.onNfc, 
            function() { console.log("listening for mime media tags"); },
            function(error) { console.log("ERROR: " + JSON.stringify(error)); }
            );
    },
    onNfc: function(nfcEvent) {
        var tag = nfcEvent.tag;
    },
    hue: function(settings) {
        $.ajax({ 
            type: 'PUT',
            url: 'http://' + hueIP + '/api/' + hueAppId + '/lights/' + lightId + '/state',
            data: JSON.stringify(settings),
            success: function(data){
                if (data[0].error) {
                    alert(JSON.stringify(data));
                }
            },
            error: function(xhr, type){
                alert('Ajax error!')
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
                    app.hueIpAddress = data[0].internalipaddress;
                    console.log(app.hueIpAddress);
                }
            },
            error: function(xhr, type){
                alert('Ajax error!')
            }
        });
    },
    ensureAuthorized: function() {
        
        var data = {"devicetype":"test user","username":"newdeveloper"};
        
        $.ajax({ 
            type: 'POST',
            url: 'http://' + hueIP + '/api',
            data: JSON.stringify(settings),
            success: function(data){
                if (data[0].error) {
                    // if not authorized, users gets an alert box
                    alert(data[0].error.message);
                }
            },
            error: function(xhr, type){
                alert('Ajax error!')
            }
        });            
        
    }
    
};
