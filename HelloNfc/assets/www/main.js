document.addEventListener("deviceready", onDeviceReady, false);

 function onDeviceReady() {
	nfc.addMimeTypeListener(
	    "text/plain", 

	    parseTag,     

	    function() {
		    console.log("Success.");
	    }   ,
	    function() {
	        console.log("Failure.");
	    }
	);
}

function parseTag(nfcEvent) {
	console.log(JSON.stringify(nfcEvent.tag));
	
	var tag = nfcEvent.tag;    
	var records = tag.ndefMessage;
	
	document.write("Scanned an NDEF tag with " + records.length + " records<br>");
	document.write("Tag ID: " + nfc.bytesToHexString(tag.id) + "<br>");
	
	document.write("Tag Type: ", tag.type + "<br>");        
	document.write("Max Size: ", tag.maxSize + " bytes<br>");
	document.write("Is Writable: ", tag.isWritable + "<br>");
	document.write("Can Make Read Only: ", tag.canMakeReadOnly + "<br>");
	
	for (var i = 0; i < records.length; i++) {
		var payload; 
		document.write("record "+ i + ": " + nfc.bytesToString(records[i].type) + "<br>");
		if (records[i].id && (records[i].id.length > 0)) {
			document.write("Record Id: " + records[i].id + "<br>");
		} 
		document.write("record TNF: " + tnfToString(records[i].tnf) + "<br>");
		
		var recordType = nfc.bytesToString(records[i].type);
		document.write("record Type: " + recordType + "<br>"); 
		
		switch (recordType) {
			case "T":
				var langCodeLength = records[i].payload[0];
				var text = records[i].payload.slice((1 + langCodeLength), records[i].payload.length);
				document.write("Record text: " + nfc.bytesToString(text) + "<br>");
			break;
			case "U":
				var url =  nfc.bytesToString(records[i].payload);
				document.write("Record text: " + url  + "<br>");
			break;
			default:
				// attempt display as a string
				payload = nfc.bytesToString(records[i].payload);
			break;
		}
	}
}


function tnfToString(tnf) {
    var value = tnf;
    
    switch (tnf) {
    case ndef.TNF_EMPTY:
        value = "Empty";
        break; 
    case ndef.TNF_WELL_KNOWN:
        value = "Well Known";
        break;     
    case ndef.TNF_MIME_MEDIA:
        value = "Mime Media";
        break;     
    case ndef.TNF_ABSOLUTE_URI:
        value = "Absolute URI";
        break;     
    case ndef.TNF_EXTERNAL_TYPE:
        value = "External";
        break;     
    case ndef.TNF_UNKNOWN:
        value = "Unknown";
        break;     
    case ndef.TNF_UNCHANGED:
        value = "Unchanged";
        break;     
    case ndef.TNF_RESERVED:
        value = "Reserved";
        break;     
    }
    return value;
}