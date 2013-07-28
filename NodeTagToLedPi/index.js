var ndef = require('ndef'),               // require ndef package
    mifare = require('mifare-classic'),   // require this package
	 Gpio = require('onoff').Gpio, 				// require onoff package
	 led = [];										// array of LEDs
	 
led[0] = new Gpio(18, 'out'),					// set LED I/O pins as outputs	
led[1] = new Gpio(23, 'out'),
led[2] = new Gpio(24, 'out'),
led[3] = new Gpio(25, 'out'),


/*
led[0] = new Gpio(gpio1_21, 'out'),					// set LED I/O pins as outputs	
led[1] = new Gpio(gpio1_21, 'out'),
led[2] = new Gpio(gpio1_21, 'out'),
led[4] = new Gpio(gpio1_21, 'out'),
*/
  
setInterval(readTags, 2000);           	// read every 2 seconds

function readTags() { 
   mifare.read(function(error, buffer) {  // read tag
      if (error) {                        // if there's an error result
        console.log("Read failed ");      // let user know about the error
        console.log(error);
      } else {                            // you got an NDEF message
         // decode the message into a JSON object:
         var message = ndef.decodeMessage(buffer.toJSON());
         // print the message's records:
         console.log("Found NDEF message with " + message.length +
            // "record" if there's only one, "records" if there's more:
            (message.length === 1 ? " record" : " records" ));
         // print the message:
         console.log(ndef.stringify(message));  
         // loop over the LEDs and turn on one for each record: 
         for (var pinNum=0; pinNum<4; pinNum++) {  
         	console.log(pinNum);          
            if (pinNum < message.length) {   // LED0 = 1 record, LED1 = 2 records, etc
               //io.digitalWrite(pin, 1);   	
               led[pinNum].writeSync(1);		// turn on pin
            } else {
               //io.digitalWrite(pin, 0);   	
               led[pinNum].writeSync(0);		// turn off pin
            }
         }  
      }
   });
}

