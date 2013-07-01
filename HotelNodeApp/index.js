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

var serialport = require("serialport"),				// include the serialport library
	SerialPort  = serialport.SerialPort,			// make a local instance of serial
	express = require('express'),					// make an instance of express
	app = express(),								// start Express framework
  	server = require('http').createServer(app),		// start an HTTP server
  	record = {};									// NDEF record to send
  	
app.use(express.bodyParser());						// use the bodyParser middleware for express

var portName = process.argv[2];						// third word of the command line should be serial port name
console.log("opening serial port: " + portName);	// print out the port you're listening on
server.listen(8080);								// listen for incoming requests on the server
console.log("Listening for new clients on port 8080");

// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});

// open the serial port:
var myPort = new SerialPort(portName, { 
	// look for newline at the end of each data packet:
	parser: serialport.parsers.readline("\n") 
});
  
// listen for new serial data:  
myPort.on('data', function (data) {
	// for debugging, you should see this in the terminal window:
	console.log("Received: " +data);
});


// take anything that begins with /submit:
app.post('/submit', function (request, response) {
  record.name = request.body.name;				// get the name from the body
  record.room = request.body.room;				// get the room number from the body
  var days = request.body.days;					// get the number of days from the body
  var today = new Date();						// get the time from Date
  record.checkin = today.valueOf();				// convert to unix time
  record.checkout = record.checkin + 86400;		// calculate the checkout time

  // send it out the serial port:
  myPort.write(JSON.stringify(record) + "\n");
  
  // write the HTML head back to the browser:
  response.writeHead(200, {'Content-Type': 'text/html'});	
  // send the data:
  response.write("Sent the following to the writer:<br>");
  response.write(JSON.stringify(record) + "<p>");
  // send the link back to the index and close the link:
  response.end("<a href=\"/\">Return to form</a>");
});
