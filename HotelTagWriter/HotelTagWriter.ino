/*
  Tag format: 1 JSON-formatted text record:
 {
 name: username,
 room: room number (long int),
 checkin: checkin time (unix time, long int),
 checkout: checkout time (unix time, long int),
 }
 */

// SEEED STUDIO
#include <SPI.h>
#include <PN532SPI.h>
// end SEEED STUDIO

// ADAFRUIT
//#include <Wire.h>
//#include <PN532_I2C.h>
// end ADAFRUIT

#include <PN532.h>
#include <NfcAdapter.h>

// SEEED STUDIO
PN532SPI pn532spi(SPI, 10);
NfcAdapter nfc = NfcAdapter(pn532spi);
// end SEEED STUDIO

// ADAFRUIT
//PN532_I2C pn532_i2c(Wire);
//NfcAdapter nfc = NfcAdapter(pn532_i2c);
// end ADAFRUIT

//#include <Wire.h>
//#include <Adafruit_NFCShield_I2C.h>
//#include <NfcAdapter.h>

const int greenLed = 9;         // pin for the green LED
const int redLed = 8;          // pin for the red LED

//NfcAdapter nfc = NfcAdapter();  // instance of the NFC adapter library
String inputString = "";        // string for input from serial port
long lightOnTime = 0;           // last time the LEDs were turned on, in ms

boolean readyToWrite = false;

void setup() {
  Serial.begin(9600);           // initialize serial communications
  nfc.begin();                  // initialize NfcAdapter
  pinMode(greenLed, OUTPUT);    // make pin 9 an output
  pinMode(redLed, OUTPUT);      // make pin 8 an output
}

void loop() {
  
  while (Serial.available() > 0) {
    //processChar(Serial.read());
    char thisChar = Serial.read();
    // add incoming character to the end of inputString:
    inputString += thisChar; 
    // if the incoming character is }, you're done. Look for a tag:
    if (thisChar == '}') {
      readyToWrite = true;
    }
  }
  
  if (readyToWrite) {
    lookForTag();
  }
    
  if (millis() - lightOnTime > 3000 ) {    // check every three seconds
    digitalWrite(greenLed, LOW);           // turn off pin 9
    digitalWrite(redLed, LOW);             // turn off pin 8
  }
}

void lookForTag() {

  if (nfc.tagPresent()) {                       // if there's a tag present
    NdefMessage message;                        // make a new NDEF message
    message.addTextRecord(inputString);         // add the input string as a record
    boolean success = nfc.write(message);       // attempt to write to the tag
    
    if (success) {
      Serial.println("Result: tag written."); // let the desktop app know you succeeded
      inputString = "";                       // clear the string for another read
      digitalWrite(greenLed, HIGH);           // turn on the success light
      lightOnTime = millis();
      readyToWrite = false; // TODO should allow keep writing, reset input on "{"
    } else {
      // let the desktop app know you failed:
      Serial.println("Result: failed to write to tag"); 
      digitalWrite(redLed, HIGH);              // turn on the failure light
      lightOnTime = millis();
    }
  } 
}



