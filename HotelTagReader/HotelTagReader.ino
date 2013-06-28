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

NfcAdapter nfc = NfcAdapter();
RTC_Millis clock;                  // so we have unix-like time
const int doorPin = 9;             // pin that the solenoid door lock is on

String name = "Tom Igoe";          // the guest
long roomNumber = 3327;            // the room number
long checkin = 0;                  // checkin time
long checkout = 0;                 // checkout time
String cardName = "";              // name on the card
long cardRoomNumber = 0;           // room number on the card

void setup() {
  Serial.begin(9600);
  // set the clock to the date & time that
  // you compiled the sketch:
  clock.begin(DateTime(__DATE__, __TIME__));

  Serial.println("Hotel NDEF Reader");
  nfc.begin();
  pinMode(doorPin, OUTPUT);      // make the door lock pin an output
  digitalWrite(doorPin, LOW);    // set it low to lock the door
}

void loop(void) {
  Serial.println("\nScan a NFC tag\n");
  if (nfc.tagPresent())             // if there's a tag present
  {
    NfcTag tag = nfc.read();
    if (tag.hasNdefMessage()) // every tag won't have a message        
    {
      NdefMessage message = tag.getNdefMessage();
      // cycle through the records, printing some info from each
      int recordCount = message.getRecordCount();
      for (int i = 0; i < recordCount; i++) 
      {
        NdefRecord record = message[i]; // alternate syntax

        // we can't generically get the payload, since the tnf and type 
        // determine how the payload is decoded
        int payloadLength = record.getPayloadLength();
        byte payload[payloadLength];
        record.getPayload(payload);

        // this block would make a nice helper function, to return the payload as a String:
        String result = "";
        for (int c=0; c< payloadLength; c++) {
          result += (char)payload[c]; 
        }
        Serial.print("Payload: ");
        Serial.println(result);           
        parsePayload(result);      // assuming it's text, look for the hotel data fields
      }
      boolean unlock = checkTime(checkin, checkout);  // check if you can let them in or not
      if (unlock == true) {
        //open Door;
        digitalWrite(doorPin, HIGH);
      }

    }    
  }
  delay(3000);
  //lock Door;
  digitalWrite(doorPin, LOW);
}

void parsePayload(String data) {
  int colon = data.indexOf(':');          // find the colon in the string
  String key = data.substring(3, colon);  // before it is "en" and the key
  String value = data.substring(colon+1); // after it is the value
  //Serial.println(key);
  //Serial.println(value);
  
  if (key == "checkout"){ 
    checkout = value.toInt();         // get the checkout time in unix time
    Serial.print("Check out: ");
    Serial.println(checkout);
  }

  if (key == "checkin"){              // get the checkin time in unix time
    checkin = value.toInt();
    Serial.print("Check in: ");
    Serial.println(checkin);
  }

  if (key == "Name"){
    cardName = value;                 // get the guest name
    Serial.print("Name: ");
    Serial.println(name);
  }
  if (key == "Room"){                 // get the room number
    cardRoomNumber = value.toInt();
    Serial.print("Room: ");
    Serial.println(cardRoomNumber);
  }
}

/*
  Check to see if the current time is between the checkin time
   and the checkout time. Return true if so
*/
boolean checkTime(long checkin, long checkout) {
  boolean result = false;
  DateTime now = clock.now();
  if (cardRoomNumber == roomNumber) {
    if (now.unixtime() <= checkin) {
      Serial.println("you haven't checked in yet");
    }

    if((now.unixtime() >= checkin) && (now.unixtime() <= checkout))  {
      Serial.println("welcome back to your room." + cardName);
      result = true; 
    } 
    if(now.unixtime() >= checkout) {
      Serial.println("Thanks for staying with us! You've checked out");
    } 
  }
  return result;
}












