#!/usr/bin/env node

var ndef = require('ndef'),
    mifare = require('./mifare-classic'),
    util = require('./ndef-util');    

mifare.read(function(err, buffer) {
    if (err) {
        console.log("Read failed ");
        console.log(err);
    } else {
        var message = ndef.decodeMessage(buffer.toJSON());
        console.log("Found NDEF message with " + message.length +
            (message.length === 1 ? " record" : " records" ));
        console.log(util.printRecords(message));            
    }
})

