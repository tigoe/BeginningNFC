/*
    Node nfc web interface   
*/

var express = require('express'),               // make an instance of express
   app = express(),                            // start Express framework
   server = require('http').createServer(app), // start an HTTP server
   deviceMessage = "",                         // messages from the writer device
   ndef = require('ndef'),
   mifare = require('mifare-classic');

 
app.use(express.bodyParser());        // use the bodyParser middleware for express
server.listen(8080);                  // listen for incoming requests on the server
console.log("Listening for new clients on port 8080");


// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});


// take anything that begins with /read:
app.get('/read', function (request, response) {
   
    var message;

    // get the data:
    mifare.read(function(err, buffer) {
       response.writeHead(200, {'Content-Type': 'text/html'});   
           
        if (err) {
            console.log("Read failed ");
            console.log(err);
            response.write("There was a problem.<br/>");
            response.write(err);
        } else {            
            message = ndef.decodeMessage(buffer.toJSON());
            if (message.length > 0) {
                var text = "Found NDEF message with " + message.length + (message.length === 1 ? " record" : " records" );
                response.write("<p>" + text + "</p>");                
                response.write(ndef.stringify(message, "<br/>"));                
            } else {
                response.write("Did not find any messages<br/>");                
            }
        }
        
        response.end("<a href=\"/\">Return to form</a>");                           
    });

}); 
