#!/usr/bin/env node

var ndef = require('ndef'),
    mifare = require('./mifare-classic');

mifare.read(function(err, buffer) {
    if (err) {
        console.log("Read failed ");
        console.log(err);
    } else {
        var message = ndef.decodeMessage(buffer.toJSON());
        console.log("Found NDEF message with " + message.length +
            (message.length === 1 ? " record" : " records" ));
        printRecords(message);            
    }
})

function printRecords(message) {
    // Print out the payload for each record
    message.forEach(function(record) {
        
        console.log(" ");
        switch(record.tnf) {
            case ndef.TNF_EMPTY:
                console.log("Empty Record");
                break;
            case ndef.TNF_WELL_KNOWN:
                printWellKnown(record);
                break;            
            case ndef.TNF_MIME_MEDIA:
                console.log("MIME Media");
                print(record.type);
                print(record.payload); // might be binary 
                break;            
            case ndef.TNF_ABSOLUTE_URI:
                // URI is in the type field
                console.log("Absolute URI");            
                print(record.type);
                break;
            case ndef.TNF_EXTERNAL_TYPE:
                // AAR contains strings, other types could
                // contain binary data
                console.log("External");            
                print(record.type);
                print(record.payload);          
                break;        
            default:
                console.log("Can't process TNF " + record.tnf);
        }
    });
}

function printWellKnown(record) {
    
    if (record.tnf !== ndef.TNF_WELL_KNOWN) {
        console.log("ERROR expecting TNF Well Known");
        return;
    }
    
    // unfortunately record types are byte[]
    switch(s(record.type)) {
        case s(ndef.RTD_TEXT):
            console.log("Text Record");
            console.log(ndef.text.decodePayload(record.payload));
            break;
        case s(ndef.RTD_URI):
            console.log("URI Record");
            console.log(ndef.uri.decodePayload(record.payload));            
            break;
        case s(ndef.RTD_SMART_POSTER):
            console.log("Smart Poster");
            // the payload of a smartposter is a NDEF message
            printRecords(ndef.decodeMessage(record.payload));
            break;
        default:
            console.log("Don't know how to process " + s(record.type));
    }
}
   
// data is a String or byte[]
function print(data) {
    if (Array.isArray(data)) {
        var buffer = new Buffer(data);
        console.log(buffer.toString());
    } else {
        console.log(data);
    }
}

function s(bytes) {
    return new Buffer(bytes).toString();
}
 