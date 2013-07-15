// TODO where does this belong? Probably ndef.
// TODO is there a way to make more generic?
// TODO is there a way to indent? or pass in a line separator?
// TODO or just keep this simple and people who need something else write their own
// This whole mess should be replaced with objects that know how to print

ndef = require('ndef');

// @message - NDEF Message (array of NDEF Records)
// @separator - line separator, optional, defaults to \n
// @returns string with NDEF Message
function printRecords(message, separator) {
    
    if(!separator) { separator = "\n" }
    result = "";
    
    // Print out the payload for each record
    message.forEach(function(record) {
        result += printRecord(record);
        result += separator;
    });
    
    return result.slice(0, (-1 * separator.length));
}

// @record - NDEF Record
// @separator - line separator, optional, defaults to \n
// @returns string with NDEF Record
function printRecord(record, separator) {        
    
    if(!separator) { separator = "\n" }
    
    switch(record.tnf) {
        case ndef.TNF_EMPTY:
            result += "Empty Record";
            result += separator;            
            break;
        case ndef.TNF_WELL_KNOWN:
            result += printWellKnown(record, separator);
            break;            
        case ndef.TNF_MIME_MEDIA:
            result += "MIME Media";
            result += separator;            
            result += s(record.type);
            result += separator;            
            result += s(record.payload); // might be binary 
            break;            
        case ndef.TNF_ABSOLUTE_URI:
            // URI is in the type field
            result += "Absolute URI";
            result += separator;            
            result += s(record.type);                        
            break;
        case ndef.TNF_EXTERNAL_TYPE:
            // AAR contains strings, other types could
            // contain binary data
            result += "External";
            result += separator;                        
            result += s(record.type);
            result += separator;            
            result += s(record.payload);          
            break;        
        default:
            result += s("Can't process TNF " + record.tnf);
    }
    
    result += separator;    
    return result;
}

function printWellKnown(record, separator) {
    
    var result = "";
    
    if (record.tnf !== ndef.TNF_WELL_KNOWN) {
        return "ERROR expecting TNF Well Known";
    }
    
    // unfortunately record types are byte[]
    switch(s(record.type)) {
        case s(ndef.RTD_TEXT):
            result += "Text Record";
            result += separator;            
            result += (ndef.text.decodePayload(record.payload));
            break;
        case s(ndef.RTD_URI):
            result += "URI Record";
            result += separator;            
            result += (ndef.uri.decodePayload(record.payload));            
            break;
        case s(ndef.RTD_SMART_POSTER):
            result += "Smart Poster";
            result += separator;            
            // the payload of a smartposter is a NDEF message
            result += printRecords(ndef.decodeMessage(record.payload));
            break;
        default:
            result += ("Don't know how to process " + s(record.type));
    }
    
    return result;
}
   
// convert bytes to a String   
function s(bytes) {
    return new Buffer(bytes).toString();
}

module.exports = {
    printRecord: printRecord,
    printRecords: printRecords
}