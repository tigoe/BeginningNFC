var ndef = require('ndef'),               // require ndef package
    mifare = require('mifare-classic'),   // require this package
    io = require('bonescript');           // bonescript is built into the BB

io.pinMode('USR0', 'out');                // set LED I/O pins as outputs
io.pinMode('USR1', 'out');
io.pinMode('USR2', 'out');
io.pinMode('USR3', 'out');

setInterval(readTags, 2000);              // read every 2 seconds

function readTags() {
   mifare.read(function(error, buffer) {  // read tag
      if (error) {                        // if there's an error result
        console.log("Read failed ");      // let user know about the error
        console.log(error);
      } else {                            // you got an NDEF message
         // decode the message into an object:
         var message = ndef.decodeMessage(buffer.toJSON());
         printMessage(message);
         lightLEDs(message.length);
      }
   });
}

function printMessage(message) {

   if (message.length > 0) {
      // "record" if there's only one, "records" if there's more:
      var records = (message.length === 1 ? " record" : " records" );
      console.log("Found NDEF message with " + message.length + records);
      console.log(ndef.stringify(message));
   }
}

function lightLEDs(number) {
   // loop over the LEDs and turn on one for each record:
   for (var pinNum=0; pinNum<4; pinNum++) {
      var pin = 'USR' + pinNum;        // set pin name, USR0 - USR3
      if (pinNum < number) {   // USR0=1 record, USR1=2 records...
         io.digitalWrite(pin, 1);      // turn on pin
      } else {
         io.digitalWrite(pin, 0);      // turn off pin
      }
   }
}
