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

String name = "Tom Igoe";
String roomNumber = String(3327);

void setup() {
  Serial.begin(9600);
  // following line sets the clock to the date & time this sketch was compiled
  clock.begin(DateTime(__DATE__, __TIME__));
  Serial.println("NDEF Writer");
  nfc.begin();
}

void loop() {
  DateTime now = clock.now();
  Serial.println("\nPlace a formatted Mifare Classic NFC tag on the reader.");
  if (nfc.tagPresent()) {
    NdefMessage message = NdefMessage();
    message.addTextRecord("Name: " + name);
    message.addTextRecord("Room: " + roomNumber);
    String checkin = "checkin: ";
    checkin += now.unixtime(); // now
    message.addTextRecord(checkin);
    String checkout = "checkout: ";
    checkout += now.unixtime() + (7 * days); // one week later

    message.addTextRecord(checkout);

    boolean success = nfc.write(message);
    if (success) {
      Serial.println("Try reading this tag with your phone.");
    } 
    else {
      Serial.println("Write failed");
    }
  }
  delay(5000);
}


