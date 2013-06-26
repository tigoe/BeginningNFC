
const int led = 13;        // give pin 13 a name

void setup() {
  Serial.begin(9600);      // open serial communication at 9600 bps
  pinMode(led, OUTPUT);    // make the LED pin an output
}

void loop() {
  if (Serial.available()) {
    char input = Serial.read();          // read a byte from the serial port
    if (input == 'H' || input == 'h') {  // if it's H or h
      digitalWrite(led, HIGH);           // turn the LED on
      Serial.println(input);             // echo what the user typed
    } 
    else if (input == 'L' || input == 'l') {  // if it's L or l
      digitalWrite(led, LOW);                 // turn the LED off
      Serial.println(input);                  // echo what the user typed
    }
  }
}

