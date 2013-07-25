var Gpio = require('onoff').Gpio,
	led = [];
    led[0] = new Gpio(18, 'out'),					// set LED I/O pins as outputs	
	 led[1] = new Gpio(23, 'out'),
	 led[2] = new Gpio(24, 'out'),
	 led[4] = new Gpio(25, 'out');
