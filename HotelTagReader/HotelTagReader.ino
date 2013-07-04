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
#include <Time.h>  

NfcAdapter nfc = NfcAdapter();     // instance of the nfcAdapter
const int doorPin = 11;            // pin that the solenoid door lock is on
const int greenLed = 9;            // pin for the green LED
const int redLed = 10;             // pin for the red LED
const long roomNumber = 3327;      // the room number

time_t checkin = 0;                // checkin time
time_t checkout = 0;               // checkout time
String cardName = "";              // name on the card
long cardRoomNumber = 0;           // room number on the card
long unlockTime = 0;               // last time you opened the lock

void setup() {
  Serial.begin(9600);
  // set the clock to the date & time
  // hour (24-hour format), minute, second, day, month, year:
  setTime(19, 33, 00, 4, 7, 2013);

  Serial.println("Hotel NDEF Reader");
  nfc.begin();                   // initialize the NFC reader
  pinMode(doorPin, OUTPUT);      // make the door lock pin an output
  digitalWrite(doorPin, LOW);    // set it low to lock the door
  pinMode(greenLed, OUTPUT);     // make pin 9 an output
  pinMode(redLed, OUTPUT);       // make pin 10 an output
}

void loop() {
  Serial.println("\nScan a NFC tag\n");
  if (nfc.tagPresent())   {       // if there's a tag present
    NfcTag tag = nfc.read();
    if (tag.hasNdefMessage()) {   // every tag won't have a message        
      NdefMessage message = tag.getNdefMessage();
      // cycle through the records, printing some info from each:
      int recordCount = message.getRecordCount();
      for (int i = 0; i < recordCount; i++) {
        NdefRecord record = message[i];

        // you can't generically get the payload, since the tnf and type 
        // determine how the payload is decoded. so find that out:
        int payloadLength = record.getPayloadLength();
        byte payload[payloadLength];
        record.getPayload(payload);

        // this block would make a nice helper function, to return the payload as a String:
        String result = "";
        for (int c=0; c< payloadLength; c++) {
          result += (char)payload[c]; 
        }          
        // assuming it's text, look for the hotel data fields:
        parsePayload(result);      
      }

      // check if you can let them in or not:
      boolean unlock = checkTime(checkin, checkout);  
      if (unlock == true) {
        digitalWrite(doorPin, HIGH);    // open Door;
        digitalWrite(greenLed, HIGH);   // turn on the green LED
        unlockTime = millis();          // timestamp the moment the lock was opened
      } 
      else {
        digitalWrite(redLed, HIGH);     // indicate a failure
      }
    }    
  }
  if (millis() - unlockTime > 3000 ) {  // check every three seconds
    digitalWrite(greenLed, LOW);        // turn off pin 9
    digitalWrite(redLed, LOW);          // turn off pin 10
    digitalWrite(doorPin, LOW);         // lock Door;
  }
}

void parsePayload(String data) {
  // you only care about what's between the brackets, so:
  int openingBracket = data.indexOf('{');      
  int closingBracket = data.indexOf('}');
  // your individual data is between two commas:
  int lastComma = openingBracket;
  int comma = 0;
  // parse the data until the last comma:
  while (comma != -1){
    String key, value;      
    int colon = data.indexOf(':', lastComma); // get the next colon
    comma = data.indexOf(',', colon);         // get the next comma

    // key is between the last comma and the colon:
    key = data.substring(lastComma+1, colon); 
    // if there are no more commas:
    if (comma == -1) {    // value is between colon and closing:
      value = data.substring(colon+1, closingBracket);
    } 
    else {                // value is between colon and next comma:
      value = data.substring(colon+1, comma); 
    }

    // now to get rid of the quotation marks:
    key.replace("\"", " ");      // replace any " around the key with spaces
    key.trim();                  // trim away the spaces
    value.replace("\"", " ");    // replace any " around the value with spaces
    value.trim();                // trim away the spaces

    // now, look for the possible data you care about:
    checkItem(key, value);
    lastComma = comma;
  } 
}

/*
  Check key/value string pairs to see if they are ones you care about:
 */
void checkItem(String thisKey, String thisValue) {
  if (thisKey == "checkout"){ 
    checkout = thisValue.toInt();
  }

  if (thisKey == "checkin"){       
    checkin = thisValue.toInt();
  }

  if (thisKey == "name"){
    cardName = thisValue; 
  }
  if (thisKey == "room"){
    cardRoomNumber = thisValue.toInt();
  } 
}

/*
  Check to see if the current time is between the checkin time
 and the checkout time. Return true if so:
 */
boolean checkTime(time_t arrival, time_t departure) {
  boolean result = false;
  if (cardRoomNumber == roomNumber) {
    if (now() <= arrival) {
      Serial.println("you haven't checked in yet");
    }

    if((now() >= arrival) && (now() <= departure))  {
      Serial.println("welcome back to your room, " + cardName);
      result = true; 
    } 
    if(now() >= departure) {
      Serial.println("Thanks for staying with us! You've checked out");
    } 
  }
  return result;
}

