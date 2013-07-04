/*
  Tag format: 1 JSON-formatted text record:
 {
 name: username,
 room: room number (long int),
 checkin: checkin time (unix time, long int),
 checkout: checkout time (unix time, long int),
 }
 */

#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <NfcAdapter.h>

const int greenLed = 9;         // pin for the green LED
const int redLed = 10;          // pin for the red LED

NfcAdapter nfc = NfcAdapter();  // instance of the NFC adapter library
String inputString = "";        // string for input from serial port
long lightOnTime = 0;           // last time the LEDs were turned on, in ms

void setup() {
  Serial.begin(9600);           // initialize serial communications
  nfc.begin();                  // initialize NfcAdapter
  pinMode(greenLed, OUTPUT);    // make pin 9 an output
  pinMode(redLed, OUTPUT);      // make pin 10 an output
}

void loop() {
  // look for incoming serial data:
  if (Serial.available() > 0) { 
    char thisChar = Serial.read();
    // add incoming character to the end of inputString:
    inputString += thisChar; 
    // if the incoming character is }, you're done. Look for a tag:
    if (thisChar == '}' && inputString != "") {
      boolean success = lookForTag(inputString);
      if (success) {
        Serial.println("Result: tag written."); // let the desktop app know you succeeded
        inputString = "";                       // clear the string for another read
        digitalWrite(greenLed, HIGH);           // turn on the success light
        lightOnTime = millis();
      } 
      else {
        // let the desktop app know you failed:
        Serial.println("Result: failed to write to tag"); 
        digitalWrite(redLed, HIGH);              // turn on the failure light
        lightOnTime = millis();
      }
    }
  }
  
  if (millis() - lightOnTime > 3000 ) {    // check every three seconds
    digitalWrite(greenLed, LOW);           // turn off pin 9
    digitalWrite(redLed, LOW);             // turn off pin 10
  }
}

boolean lookForTag(String myString) {
  boolean result = false;
  if (nfc.tagPresent()) {              // if there's a tag present
    NdefMessage message;               // make a new NDEF message
    message.addTextRecord(myString);   // add the input string as a record
    result = nfc.write(message);       // attempt to write to the tag
  } 
  return result;                       // return success or failure
}



