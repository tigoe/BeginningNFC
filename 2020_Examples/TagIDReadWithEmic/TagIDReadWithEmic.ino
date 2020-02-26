/*
  Simple tag read example
  Uses I2C interface for NFC shield

  Reads a 4-byte tag ID  as a string
  and compares it to a known tag string

  edited from Don Coleman's library example
  created 11 Feb 2020
  by Tom Igoe
*/

// include libraries for I2C interface to PN532 chip:
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <SoftwareSerial.h>

// Pins to connect to the emic2
// EMIC SOUT = A0, EMIC SIN = A1:
SoftwareSerial emic(A0, A1);


// make instances of PN532 and NFC libraries:
PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

// string of a known tag, in a format the library produces:
String knownTag = "EB 50 ED 65";
// last time a tag was read, in ms:
long lastTagReadTime = 0;
// delay between tag reads when a tag's just been read, in ms:
int tagReadDelay = 3000;

void setup() {
  Serial.begin(9600);
  emic.begin(9600);
  // set the word rate at 400 words per minute (can go 75 - 600 wpm):
  emic.println("W400");
  nfc.begin();
}

void loop() {
  // if the read delay has passed:
  if (millis() - lastTagReadTime > tagReadDelay) {
    // Send it out the EMIC:
    emic.println("S Scan a NFC tag");
    // send it out the serial port too:
    Serial.println("\nScan a NFC tag\n");
    // if a tag is present:
    if (nfc.tagPresent()) {
      // read the tag:
      NfcTag tag = nfc.read();
      // get the tag ID as a string:
      String tagString = tag.getUidString();
      // timestamp the read time:
      lastTagReadTime = millis();

      // Send it out the EMIC:
      emic.println("S" + tagString);
      // send it out the serial port too:
      Serial.println(tagString);
      // compare it to a known tag string:
      if (tagString == knownTag) {
        // Send it out the EMIC:
        emic.println("S it's a match");
        // send it out the serial port too:
        Serial.println("it's a match");
      }
    }
  }
}
