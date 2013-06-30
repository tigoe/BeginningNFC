#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <NfcAdapter.h>
#include "RTClib.h"

/*
  Tag format: 4 text records:
 Name: username
 Room: room number (long int)
 checkin: checkin time (unix time, long int)
 checkout: checkout time (unix time, long int)
 */

const int days = 86400L; // seconds in a day

NfcAdapter nfc = NfcAdapter();
RTC_Millis clock;

String inputString = "";

void setup() {
  Serial.begin(9600);
  // following line sets the clock to the date & time this sketch was compiled
  clock.begin(DateTime(__DATE__, __TIME__));
  Serial.println("NDEF Writer");
  nfc.begin();
}

void loop() {
  if (Serial.available()>0) {
    char thisChar = Serial.read();
    inputString += thisChar; 
    if (thisChar == '}' && inputString != "") {
      lookForTag(inputString);
    } 
  }
}

boolean lookForTag(String myString) {
  if (nfc.tagPresent()) {
    NdefMessage message;
    message.addTextRecord(myString);

    boolean success = nfc.write(message);
    if (success) {
      Serial.println("Tag written. Try reading this tag with your phone.");
      inputString = "";
    } 
    else {
      Serial.println("Write failed");
    }
  } 
}












