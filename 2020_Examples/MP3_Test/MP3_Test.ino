/*
  VS1053 example test
  using SparkFun MP3 shield
  and Adafruit VS1053 library
  in beatiful harmony
   sound file name must be 8 chars .3 chars:

  circuit:
    VS1053 module attached to the pins described below

  created 30 Nov 2018
  modified 11 Feb 2020
  by Tom Igoe

*/
// include libraries for MP3 shield:
#include <SPI.h>
#include <SD.h>
#include <Adafruit_VS1053.h>

// the VS1053 chip and SD card are both SPI devices.
// Set their respective pins. These are the pin numbers for a Sparkfun MP3 shield:
#define VS1053_RESET    8     // VS1053 reset pin
#define VS1053_CS       6     // VS1053 chip select pin 
#define VS1053_DCS      7     // VS1053 Data/command select pin 
#define CARDCS          9     // SD card chip select pin
#define VS1053_DREQ     2     // VS1053 Data request

// make an instance of the MP3 player library:
Adafruit_VS1053_FilePlayer mp3Player =
  Adafruit_VS1053_FilePlayer(VS1053_RESET, VS1053_CS, VS1053_DCS, VS1053_DREQ, CARDCS);

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

  // Set volume for left and right channels.
  // 0 = loudest, 100 = silent:
  mp3Player.setVolume(90, 90);

  // use the VS1053 interrrupt pin so it can
  // let you know when it's ready for commands.
  mp3Player.useInterrupt(VS1053_FILEPLAYER_PIN_INT);
}

void loop() {

  // if the player is stopped, play it:
  if (mp3Player.stopped()) {
    mp3Player.startPlayingFile("SOUND001.MP3");

  }

}
