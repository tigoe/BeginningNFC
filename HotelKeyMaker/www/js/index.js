var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {

        // listen for NDEF tags
        nfc.addNdefListener(
            app.onNfc, 
            function() { console.log("Listening for NDEF tags."); },
            function(reason) { alert("NFC Failed " + reason); }
        );        

        // listen for unformatted tags
        nfc.addNdefFormatableListener(
             app.onNfc,
             function() { console.log("Listening for Unformatted tags."); },
             function(reason) { alert("NFC Failed " + reason); }
         );

    },
    onNfc: function(nfcEvent) {
        // ignore tag contents and blindly overwrite
        
        var data, message;        
        
        data = JSON.stringify(app.getTagData());
        
        message = [
            ndef.mimeMediaRecord("text/hotelkey", data)
        ];
        
        nfc.write(message, app.writeSuccess, app.writeFailure);
    },    
    getTagData: function() {
        var form = document.forms[0],
            checkin = parseInt(new Date().getTime() / 1000, 10),
            days = form.days.value || 1,
            checkout = (checkin + days * 60 * 60 * 24);
                        
        return {
            name: form.name.value,
            room: form.room.value,
            checkin: checkin,
            checkout: checkout
        };
    },
    writeSuccess: function() {
        var guest = document.forms[0].name.value;
        alert(guest + " has been checked in");                
    }, 
    writeFailure: function(reason) {
        alert("Error writing tag " + reason);        
    }
};
