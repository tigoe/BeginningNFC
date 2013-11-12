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

const int lockPin = 7;             // pin that the solenoid door lock is on
const int greenLed = 9;            // pin for the green LED
const int redLed = 8;              // pin for the red LED
const long roomNumber = 3327;      // the room number

time_t checkin = 0;                // checkin time
time_t checkout = 0;               // checkout time
String cardName = "";              // name on the card
long cardRoomNumber = 0;           // room number on the card
long readTime = 0;                 // last time you tried to read a card
boolean goodRead = false;

void setup() {
  Serial.begin(9600);
  // set the clock to the date & time
  // hour (24-hour format), minute, second, day, month, year:
  setTime(00, 00, 00, 1, 9, 2013);

  nfc.begin();                   // initialize the NFC reader
  pinMode(lockPin, OUTPUT);      // make the door lock pin an output
  digitalWrite(lockPin, LOW);    // set it low to lock the door
  pinMode(greenLed, OUTPUT);     // make pin 9 an output
  pinMode(redLed, OUTPUT);       // make pin 10 an output

  Serial.println(F("\nHotel NDEF Reader"));
  Serial.print(F("Current Hotel Time is "));
  Serial.println(formatTime(now()));
  Serial.print(F("This is the lock for room "));
  Serial.println(roomNumber);
}

void loop() {
  if (millis() - readTime < 3000) {     // less than three seconds since last tag
    digitalWrite(greenLed, goodRead);   // green LED lights for a good read
    digitalWrite(lockPin, goodRead);    // lock opens if you get a good read
    digitalWrite(redLed, !goodRead);    // red LED lights if you don't
  }
  else {                                // after three seconds, lock again
    digitalWrite(greenLed, LOW);        // turn off green LED
    digitalWrite(redLed, LOW);          // turn off red LED
    digitalWrite(lockPin, LOW);         // lock door
    goodRead = listenForTag();          // listen for tags
  }
}

void resetValues() {
  checkin = 0;
  checkout = 0;
  cardName = "";
  cardRoomNumber = 0;
  goodRead = false;
}

boolean listenForTag() {
  boolean unlockDoor = false;
  resetValues();

  if (nfc.tagPresent()) {         // if there's a tag present
    readTime = millis();          // timestamp the last time you saw a card
    NfcTag tag = nfc.read();
    if (tag.hasNdefMessage()) {   // every tag won't have a message
      NdefMessage message = tag.getNdefMessage();
      NdefRecord record = message.getRecord(0);

      if (record.getTnf() == TNF_MIME_MEDIA && 
        record.getType() == "text/hotelkey") {
        // Get the length of the payload:
        int payloadLength = record.getPayloadLength();
        byte payload[payloadLength];	// make a byte array to hold the payload
        record.getPayload(payload);

        // convert the payload to a String
        String json = "";
        for (int c=0; c< payloadLength; c++) {
          json += (char)payload[c];
        }
        parsePayload(json);		// parse the payload

        // check if you can let them in or not:
        unlockDoor = isValidKey();
      }
    }
  }
  return unlockDoor;
}

/*
  Parse the JSON data from the payload String
 Save the values we care about into local variables
 */
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
    setValue(key, value);
    lastComma = comma;
  }
}

/*
  Set the variable if it's something we care about, ignore other values.
 */
void setValue(String thisKey, String thisValue) {
  if (thisKey == "checkout"){
    checkout = thisValue.toInt();
  } 
  else if (thisKey == "checkin") {
    checkin = thisValue.toInt();
  } 
  else if (thisKey == "name") {
    cardName = thisValue;
  } 
  else if (thisKey == "room") {
    cardRoomNumber = thisValue.toInt();
  }
}

/*
  Check to see if this key should open this door.
 Does the room number match? Is the current time between
 the checkin time and checkout time?
 */
boolean isValidKey() {
  boolean result = false;

  if (cardRoomNumber == roomNumber) {
    if (now() <= checkin) {
      Serial.println("You haven't checked in yet.");
      Serial.println("Current time " + formatTime(now()));
      Serial.println("Your arrival " + formatTime(checkin));
    } 
    else if ((now() >= checkin) && (now() <= checkout))  {
      Serial.println("Welcome back to your room, " + cardName + ".");
      result = true;
    } 
    else if (now() >= checkout) {
      Serial.println("Thanks for staying with us! You've checked out.");
      Serial.println("Current time " + formatTime(now()));
      Serial.println("Your departure " + formatTime(checkout));
    }
  } 
  else {
    Serial.print("This card can't unlock room ");
    Serial.print(roomNumber);
    Serial.println(".");

  }
  return result;
}

String formatTime(time_t time) {
  TimeElements elements;
  breakTime(time, elements);
  String formatted = "";
  formatted += elements.Month;
  formatted += "/";
  formatted += elements.Day;
  formatted += "/";
  formatted += elements.Year + 1970;
  formatted += " ";
  formatted += elements.Hour;
  formatted += ":";
  formatted += elements.Minute;
  return formatted;
}



