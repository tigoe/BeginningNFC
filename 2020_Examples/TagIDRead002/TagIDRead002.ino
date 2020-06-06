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

// make instances of PN532 and NFC libraries:
PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

// string of a known tag, in a format the library produces:
String knownTag = "EB 50 ED 65";
// last time a tag was read, in ms:
long lastTagReadTime = 0;
// delay between tag reads when a tag's just been read, in ms:
int tagReadDelay = 3000;
byte uidFromTag[4];
void setup() {
  Serial.begin(9600);
  nfc.begin();
}

void loop() {
  // if the read delay has passed:
  if (millis() - lastTagReadTime > tagReadDelay) {
    Serial.println("\nScan a NFC tag\n");
    // if a tag is present:
    if (nfc.tagPresent()) {
      // read the tag:
      NfcTag tag = nfc.read();
      // get the tag ID as a string:
      tag.getUid(uidFromTag, sizeof(uidFromTag));
      long tagValue = 0;
      for (int b=0; b< sizeof(uidFromTag); b++) {
        tagValue = tagValue << 8;
        tagValue = tagValue | b;
        Serial.print(b);
        Serial.print(" ");
      }
      Serial.println();
      Serial.println(tagValue);
//      String tagString = tag.getUidString();
//      // timestamp the read time:
//      lastTagReadTime = millis();
//      // print it:
//      Serial.println(tagString);
      // compare it to a known tag string:
//      if (tagString == knownTag) {
//        Serial.println("it's a match");
//      }
    }
  }
}
