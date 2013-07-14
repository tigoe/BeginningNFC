var spawn = require('child_process').spawn,
    fs = require('fs'),
    fileName = 'ndef.bin'; // TODO use temp files

// callback(err, data)
// data is stream of ndef bytes from the tag
function read(callback) {
    
    var errorMessage = "",
        readMifareClassic = spawn('mifare-classic-read-ndef', [ '-y', '-o', fileName]);

    readMifareClassic.stdout.on('data', function (data) {
        console.log('stdout: ' + data);        
    });

    readMifareClassic.stderr.on('data', function (data) {
        errorMessage += data;
        console.log('stderr: ' + data);
    });

    readMifareClassic.on('close', function (code) {
        if (code === 0 && errorMessage.length === 0) {
            fs.readFile(fileName, function (err, data) {
                callback(err, data);
                fs.unlinkSync(fileName);          
            });
        } else {
            callback(errorMessage);
        }
    });
}

// callback(err)
function write(data, callback) {
    
    var buffer = Buffer(data),
        errorMessage = "";
        
    fs.writeFile(fileName, buffer, function(err) {
        if (err) callback(err);
        writeMifareClassic = spawn('mifare-classic-write-ndef', [ '-y', '-i', fileName]);
        
        writeMifareClassic.stdout.on('data', function (data) {
            console.log('stdout:' + data);
        });
        
        writeMifareClassic.stderr.on('data', function (data) {
            errorMessage += data;
            console.log('stderr: ' + data);
        });

        writeMifareClassic.on('close', function (code) {
            if (code === 0 && errorMessage.length === 0) {
                callback(null);
                fs.unlinkSync(fileName);
            } else {
                callback(errorMessage);
            }
        });
    });
}

module.exports = {
    read: read,
    write: write
};