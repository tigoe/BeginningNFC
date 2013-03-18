# Hue Switch

Control Phillips Hue with NFC Tags

The Android device must be on the same network as the Hue hub.

The application will authenticate and add a user to the hub the first time it is run.

By default light 1 is controlled. This can be changed in index.js as app.lightId.

NFC Tags should be TNF Mime Media (0x2) with a Mime Type of "text/hue"

Payload should be valid JSON settings for the [Lights API](http://developers.meethue.com/1_lightsapi.html).

Use [PhoneGap NFC Writer](http://github.com/don/phonegap-nfc-writer) to create tags

On

    text/hue
    { "on": true }

Off

    text/hue
    { "on": false }

Blue

    text/hue
    { "bri": 200, "hue": 46920, "sat": 255 }

Color Loop

    text/hue
    { "effect": "colorloop" }
