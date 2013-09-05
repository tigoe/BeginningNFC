/*
   HotelNodeApp.js
   a node.js app to take form data and send it out serially
   Takes the elements of a form and packs a JSON object,
   then stringifies it and sends it out the serial port
   
   requires:
     * node.js (http://nodejs.org/)
     * express.js (http://expressjs.com/)
     * serialport.js (https://github.com/voodootikigod/node-serialport)
     
   based on the core examples for socket.io and serialport.js
     
   created 5 Nov 2012
   modified 30 June 2013
   by Tom Igoe
   
*/

var serialport = require("serialport"),        // include the serialport library
   SerialPort  = serialport.SerialPort,        // make a local instance of serial
   express = require('express'),               // make an instance of express
   app = express(),                            // start Express framework
   server = require('http').createServer(app), // start an HTTP server
   portName = process.argv[2],                 // third token of the command line
   record = {},                                // NDEF record to send
   deviceMessage = "";                         // messages from the writer device
    
app.use(express.bodyParser());        // use the bodyParser middleware for express
server.listen(8080);                  // listen for incoming requests on the server
console.log("Listening for new clients on port 8080");

var myPort = new SerialPort(portName, {        // open the serial port
   parser: serialport.parsers.readline("\n")   // look for newline at the end of each packet
});
console.log("opening serial port: " + portName); // print out the port you're listening on

// listen for new serial data:  
myPort.on('data', function (data) {
   // for debugging, you should see this in the terminal window:
   if (data.search("Result:") != -1) {
     deviceMessage = data;
   }
   console.log("Received: " + data);
});

// respond to web GET requests with the index.html page:
app.get('/*', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

// take anything that begins with /submit:
app.post('/submit', function (request, response) {
  record.name = request.body.name;     // get the name from the body
  record.room = request.body.room;     // get the room number from the body
  var days = request.body.days;        // get the number of days from the body
  var today = new Date(request.body.checkin);     // get the time from the body
  // calculate the checkout timeStamp:
  var departure = new Date(today.valueOf() + (days * 86400000));
  // convert to unix time in seconds:
  record.checkin = Math.round(today.valueOf()/1000); 
  record.checkout = Math.round(departure.valueOf()/1000);     
  // send it out the serial port:
  myPort.write(JSON.stringify(record) + "\n");
  
  // write the HTML head back to the browser:
  response.writeHead(200, {'Content-Type': 'text/html'});   
  // send the data:
  response.write("<p><a href=\"/\">Return to form</a></p>");
  response.write("Sent the following to the writer device:<br>");
  response.write(JSON.stringify(record) + "<p>");   
   
  // wait 3 seconds before closing the connection, so that
  // you can get a response from the writer:
  setTimeout(function() {   
   // if you got a response from the writer, send it too:
   if (deviceMessage != "") {
     response.write("response from writer device: " + deviceMessage + "<p>");
      deviceMessage = "";
   } else {
	  response.write("no tag present");
   }
   // send the link back to the index and close the link:
   response.end();   
  }, 3000);     // end of setTimeout()
});            // end of app.post()
