/*
     	Node nfc weeb interface   
*/

var express = require('express'),               // make an instance of express
   app = express(),                            // start Express framework
   server = require('http').createServer(app), // start an HTTP server
   deviceMessage = "",                         // messages from the writer device
   ndef = require('ndef'),
	mifare = require('./mifare-classic');

 
app.use(express.bodyParser());        // use the bodyParser middleware for express
server.listen(8080);                  // listen for incoming requests on the server
console.log("Listening for new clients on port 8080");


// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});


// take anything that begins with /read:
app.get('/read', function (request, response) {
   
  // wait 500 ms before responding to browser, so that
  // you can get a response from the writer:
  setTimeout(function() { 
	  var message;
	  
	  // get the data:
	   mifare.read(function(err, buffer) {
			if (err) {
				console.log("Read failed ");
				console.log(err);
			} else {
				message = ndef.decodeMessage(buffer.toJSON());
				console.log("Found NDEF message with " + message.length +
				(message.length === 1 ? " record" : " records" ));
				printRecords(message);            
			}
		});
  
	   // write the HTML head back to the browser:
	   response.writeHead(200, {'Content-Type': 'text/html'});   
	   

   // if you got a response from the writer, send it too:
   if (deviceMessage != "") {
     response.write("response from tag: " + message + "<p>");
      deviceMessage = "";
   }
   // send the link back to the index and close the link:
   response.end("<a href=\"/\">Return to form</a>");   
  }, 500);     // end of setTimeout()
});            // end of app.post()



function printRecords(message) {
	var result;
    // Print out the payload for each record
    message.forEach(function(record) {
        
        result += " ";
        switch(record.tnf) {
            case ndef.TNF_EMPTY:
                result += "Empty Record";
                break;
            case ndef.TNF_WELL_KNOWN:
                result += printWellKnown(record);
                break;            
            case ndef.TNF_MIME_MEDIA:
                result += "MIME Media";
                result += print(record.type);
                result += print(record.payload); // might be binary 
                break;            
            case ndef.TNF_ABSOLUTE_URI:
                // URI is in the type field
                result += "Absolute URI";            
                result += print(record.type);
                break;
            case ndef.TNF_EXTERNAL_TYPE:
                // AAR contains strings, other types could
                // contain binary data
                result += "External";            
                result += print(record.type);
                result += print(record.payload);          
                break;        
            default:
                result += "Can't process TNF " + record.tnf;
        }
    });
    return result;
}

function printWellKnown(record) {
    if (record.tnf !== ndef.TNF_WELL_KNOWN) {
        result += "ERROR expecting TNF Well Known";
        return;
    }
    
    // unfortunately record types are byte[]
    switch(s(record.type)) {
        case s(ndef.RTD_TEXT):
            result += "Text Record";
            result += ndef.text.decodePayload(record.payload);
            break;
        case s(ndef.RTD_URI):
            result += "URI Record";
            result += ndef.uri.decodePayload(record.payload);            
            break;
        case s(ndef.RTD_SMART_POSTER):
            result += "Smart Poster";
            // the payload of a smartposter is a NDEF message
            printRecords(ndef.decodeMessage(record.payload));
            break;
        default:
            result += "Don't know how to process " + s(record.type);
    }
    return result;
}
   
// data is a String or byte[]
function print(data) {
	var result;
    if (Array.isArray(data)) {
        var buffer = new Buffer(data);
        result = buffer.toString();
        result += buffer.toString();
    } else {
        result = buffer.toString();    
        result += data;
    }
    return result;
}

function s(bytes) {
    return new Buffer(bytes).toString();
}
 
 