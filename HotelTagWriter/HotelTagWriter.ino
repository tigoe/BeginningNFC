/*
  Tag format: 1 JSON-formatted text record:
 {
 name: username,
 room: room number (long int),
 checkin: checkin time (unix time, long int),
 checkout: checkout time (unix time, long int),
 }
 */

// Uncomment the SEEED or ADAFRUIT sections below based on which shield you are using

// SEEED STUDIO
//#include <SPI.h>
//#include <PN532_SPI.h>
//#include <PN532.h>
//#include <NfcAdapter.h>
//#include <Time.h>
//
//PN532_SPI pn532spi(SPI, 10);
//NfcAdapter nfc = NfcAdapter(pn532spi);
// end SEEED STUDIO

// ADAFRUIT
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <Time.h>

PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);
// end ADAFRUIT

const int greenLed = 9;         // pin for the green LED
const int redLed = 8;           // pin for the red LED

String inputString = "";        // string for input from serial port
long lightOnTime = 0;           // last time the LEDs were turned on, in ms
long lastReadTime = 0;          // last time we checked for NFC tag, in ms

boolean readyToWrite = false;   // true when we are ready to write to NFC tag

void setup() {
  Serial.begin(9600);           // initialize serial communications
  nfc.begin();                  // initialize NfcAdapter
  pinMode(greenLed, OUTPUT);    // make pin 9 an output
  pinMode(redLed, OUTPUT);      // make pin 8 an output
}

void loop() {
  
  while (Serial.available() > 0) {

    char thisChar = Serial.read();
    // add incoming character to the end of inputString:
    inputString += thisChar; 

    if (thisChar == '{') {
      // new message, reset buffer
      inputString = "{";
      readyToWrite = false;
    } else if (thisChar == '}') {
      // end of message, ready to write to tag
      Serial.println("Ready to write data to tag");
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

  if (millis() - lastReadTime > 3000) {           // read every three seconds
    if (nfc.tagPresent()) {                       // if there's a tag present
      NdefMessage message;                        // make a new NDEF message
      message.addMimeMediaRecord("text/hotelkey", inputString); // add the input string as a record
      boolean success = nfc.write(message);       // attempt to write to the tag
    
      if (success) {
        Serial.println("Result: tag written.");   // let the desktop app know you succeeded
        digitalWrite(greenLed, HIGH);             // turn on the success light
        lightOnTime = millis();
      } else {
        // let the desktop app know you failed:
        Serial.println("Result: failed to write to tag"); 
        digitalWrite(redLed, HIGH);              // turn on the failure light
        lightOnTime = millis();
      }
    }
    lastReadTime = millis();
  } 
}

