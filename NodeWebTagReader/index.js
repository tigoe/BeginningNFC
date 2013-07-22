/*
	NodeWebTagReader.js	
*/

var app = require('express')(),						// start Express framework
  	server = require('http').createServer(app),		// start an HTTP server
  	io = require('socket.io').listen(server),		// filter the server using socket.io
  	ndef = require('ndef'),      			// require ndef package
   mifare = require('mifare-classic'),   // require this package
  	message,
   connected = false;

server.listen(8080);								// listen for incoming requests on the server
console.log("Listening for new clients on port 8080");

  
// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});


// listen for new socket.io connections:
io.sockets.on('connection', function (socket) {
	// if the client connects:
	if (!connected) {
    	console.log('user connected');
    	socket.emit('tagEvent', 'listening for tags...');
    	connected = true;
    	setInterval(mifare.read, 1000);
    }

	// if the client disconnects:
	socket.on('disconnect', function () {
    	console.log('user disconnected');
    	connected = false;
    	clearInterval();
  	});
  	
  		// get the data:
	mifare.read(function(err, buffer) {
		var text; 
		console.log('reading'); 
		if (err) {
			console.log("Read failed ");
			console.log(err);
		} else {   
			if (connected) {
				console.log('connected, reading');        
				message = ndef.decodeMessage(buffer.toJSON());
				console.log(message.length);
				if (message.length > 0) {
					text = "Found NDEF message with " + message.length + 
					(message.length === 1 ? " record" : " records" );
					text += ndef.stringify(message);   
				   // send a serial event to the web client with the data:
					socket.emit('tagEvent', text);	
					console.log(text);             
				} else {
					console.log("Did not find any messages");              
				}
			} else {
					console.log('not connected');
			}
		}
	});
});
  