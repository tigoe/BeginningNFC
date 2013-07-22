/*
   NodeNdefWriterWeb.js
   
*/

var ndef = require('ndef'),               // require ndef package
    mifare = require('mifare-classic'),   // require this package
    express = require('express'),               // make an instance of express
    app = express(),                            // start Express framework
    server = require('http').createServer(app), // start an HTTP server
    record = {},                                // NDEF record to send
    deviceMessage = "";                         // messages from the writer device
    
app.use(express.bodyParser());        // use the bodyParser middleware for express
server.listen(8080);                  // listen for incoming requests on the server
console.log("Listening for new clients on port 8080");

// respond to web GET requests with the index.html page:
app.get('/*', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

// take anything that begins with /submit:
app.post('/submit', function (request, response) {
  var days = request.body.days,        // get the number of days from the body
      today = new Date(request.body.checkin),     // get the time from the body
      // calculate the checkout timeStamp:
      departure = new Date(today.valueOf() + (days * 86400000)),
      nfcResponse,                     // the response from the NFC reader       
      message,                         // the NFC message to write
      bytes;                           // byte stream to write it with
      
  record.name = request.body.name;     // get the name from the body
  record.room = request.body.room;     // get the room number from the body
  // convert to unix time in seconds:
  record.checkin = Math.round(today.valueOf()/1000); 
  record.checkout = Math.round(departure.valueOf()/1000);     

   message = [
       ndef.textRecord(JSON.stringify(record)), // make a text record
   ];

   bytes = ndef.encodeMessage(message);      // encode the record as a byte stream
      
   mifare.write(bytes, function(error) {     // write function
       if (error) {                          // if there's an error,
           nfcResponse = "Write failed";  // report it
           nfcResponse += error; 
       } else {
           nfcResponse = "Tag written successfully" + JSON.stringify(record);         
       }
       console.log(nfcResponse);// report that the tag was written
       // write the HTML head back to the browser:
       response.writeHead(200, {'Content-Type': 'text/html'});   
       // send the data:
       response.write("Wrote the following to the card:<br>");
       response.write(nfcResponse + "<p>");
       // send the link back to the index and close the link:
       response.end("<a href=\"/\">Return to form</a>"); 
   });         // end of mifare.write()
});            // end of app.post()

