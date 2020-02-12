/*
  VS1053 example with PN523 NCF shield
  using SparkFun MP3 shield
  and Adafruit VS1053 library
  in beatiful harmony
  and Adafruit NFC shield
   sound file name must be 8 chars .3 chars:

  circuit:
    VS1053 module attached to the pins described below
PN523 shield attached to pins A4 and A5 (SDA and SCL)

  created 30 Nov 2018
  modified 11 Feb 2020
  by Tom Igoe

*/
// include libraries for MP3 shield:
#include <SPI.h>
#include <SD.h>
#include <Adafruit_VS1053.h>

// include libraries for NFC shield:
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>

// Mank instances of the NFC shield drivers:
PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

// the VS1053 chip and SD card are both SPI devices.
// Set their respective pins:
#define VS1053_RESET    8     // VS1053 reset pin
#define VS1053_CS       6     // VS1053 chip select pin 
#define VS1053_DCS      7     // VS1053 Data/command select pin 
#define CARDCS          9     // SD card chip select pin
#define VS1053_DREQ     2     // VS1053 Data request

// make an instance of the MP3 player library:
Adafruit_VS1053_FilePlayer mp3Player =
  Adafruit_VS1053_FilePlayer(VS1053_RESET, VS1053_CS, VS1053_DCS, VS1053_DREQ, CARDCS);

// known tag strings:
String tags[] = {"EB 50 ED 65", "5B 03 EE 65"};

// delay between tag reads, 3 seconds:
int tagReadDelay = 3000;
// last read time, in millis:
long lastReadTime = 0;

void setup() {
  Serial.begin(9600);

  // reset the VS1053 by taking reset low, then high:
  pinMode(VS1053_RESET, OUTPUT);
  digitalWrite(VS1053_RESET, LOW);
  delay(10);
  digitalWrite(VS1053_RESET, HIGH);

  // initialize the MP3 player:
  if (!mp3Player.begin()) {
    Serial.println("VS1053 not responding. Check to see if the pin numbers are correct.");
    while (true); // stop
  }

  // initialize the SD card on the module:
  if (!SD.begin(CARDCS)) {
    Serial.println("SD failed, or not present");
    while (true);  // stop
  }

  // initialize the NFC reader:
  nfc.begin();

  // Set volume for left and right channels.
  // 0 = loudest, 100 = silent:
  mp3Player.setVolume(90, 90);

  // use the VS1053 interrrupt pin so it can
  // let you know when it's ready for commands.
  mp3Player.useInterrupt(VS1053_FILEPLAYER_PIN_INT);
}

void loop() {
  // if the tag read delay has passed, look for a new tag:
  if (millis() - lastReadTime > tagReadDelay) {
    // if there is a tag present:
    if (nfc.tagPresent()) {
      // read the tag and print it:
      NfcTag tag = nfc.read();
      String tagString = tag.getUidString();
      Serial.println(tagString);
      // save the millis as the last read time:
      lastReadTime = millis();

      // if the player is playing, stop it:
      if (!mp3Player.stopped()) {
        mp3Player.stopPlaying();
      }
      // check to see if the tag string matches either of the known tags:
      if (tagString == tags[0]) {
        // play sound 1:
        mp3Player.startPlayingFile("SOUND001.MP3");
      }
      if (tagString == tags[1]) {
        // play sound 2:
        mp3Player.startPlayingFile("SOUND002.MP3");
      }
    }
  }
}
