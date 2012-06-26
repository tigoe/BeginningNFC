/*global NdefPlugin, Ndef */

function writeTag(nfcEvent) {
  // ignore what's on the tag for now, just overwrite
  
  var mimeType = document.forms[0].elements["mimeType"].value,
    payload = document.forms[0].elements["payload"].value,
    record = ndef.mimeMediaRecord(mimeType, nfc.stringToBytes(payload));

  nfc.write(
        [record], 
        function () {
            navigator.toast.showShort("Wrote data to tag.");
            navigator.notification.vibrate(100);
        }, 
        function (reason) {
            navigator.notification.alert(reason, function() {}, "There was a problem");
        }
  );   
}

var ready = function () {
  
  function win() {
    console.log("Listening for NDEF tags");
  }
  
  function fail() {
    alert('Failed to register NFC Listener');
  }
  
  nfc.addNdefListener(writeTag, win, fail);

  document.addEventListener("menubutton", showSampleData, false);

};

document.addEventListener('deviceready', ready, false);

var data = [
    {
        mimeType: 'text/plain',
        payload: 'Hello PhoneGap'
    },
    {
        mimeType: 'text/pg',
        payload: 'Hello PhoneGap'
    },
    {
        mimeType: 'text/x-vCard',
        payload: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Coleman;Don;;;\n' +
            'FN:Don Coleman\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:215-358-1780\n' +
            'EMAIL;WORK:dcoleman@chariotsolutions.com\n' +
            'END:VCARD'
    },
    {
        mimeType: 'text/x-vCard',
        payload: 'BEGIN:VCARD\n' +
            'VERSION:2.1\n' +
            'N:Griffin;Kevin;;;\n' +
            'FN:Kevin Griffin\n' +
            'ORG:Chariot Solutions;\n' +
            'URL:http://chariotsolutions.com\n' +
            'TEL;WORK:215-358-1780\n' +
            'EMAIL;WORK:kgriffin@chariotsolutions.com\n' +
            'END:VCARD'
    },
    {
        mimeType: 'game/rockpaperscissors',
        payload: 'Rock'
    },
    {
        mimeType: '',
        payload: ''
    }
];

var index = 0;
function showSampleData() {
    var mimeTypeField = document.forms[0].elements["mimeType"],
      payloadField = document.forms[0].elements["payload"],
      record = data[index];
    
    index++;
    if (index >= data.length) {
        index = 0;
    }
    
    mimeTypeField.value = record.mimeType;
    payloadField.value = record.payload;    
}
