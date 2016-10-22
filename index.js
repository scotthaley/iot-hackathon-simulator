'use strict';

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var deviceID = "Store100Position1";

var connectionString = 'HostName=IoTHackathon.azure-devices.net;DeviceId=' + deviceID + ';SharedAccessKey=ayGOXtRnbvyhjYg1kn+UDMSQ4zzwcHJpEd0kcfJyerI=';

var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    // if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

var addresses = [
  "00:0C:29:9C:B3:33",
  "00:1B:63:84:45:E6",
  "E8:11:32:4E:07:DB"];

var nodes = [
    {x: 5.5, y: 2.5, id: 'node 1', range: 4},
    {x: 0.5, y: -4.5, id: 'node 2', range: 4},
    {x: 0.5, y: 1.5, id: 'node 3', range: 4},
    {x: -2.5, y: -4.5, id: 'node 4', range: 4},
    {x: -2.5, y: 1.5, id: 'node 5', range: 4},
    {x: -5.5, y: -4.5, id: 'node 6', range: 4},
    {x: -5.5, y: 1.5, id: 'node 7', range: 4},
    {x: -5.5, y: 4.5, id: 'node 8', range: 4},
    {x: 2.5, y: 4.5, id: 'node 9', range: 4},
	{x: 6, y: -3.5, id: 'node 10', range: 4}
];

var wifiDevices = [
    {x: 9, y: 2.5, step: 0, path: [{x: 7, y: 2.5}, {x: 7, y: -6}, {x: -8, y: -6}, {x: -8, y: 6}]}
]

function updateWifiDevices() {
    var toRemove = [];
    for (var i in wifiDevices) {
        var wd = wifiDevices[i];
        var isAtPoint = 0;
        var nextPoint = wd.path[wd.step];
        if (nextPoint) {
            if (wd.x < nextPoint.x - 0.05) {
                wd.x += 0.01;
            } else if (wd.x > nextPoint.x + 0.05) {
                wd.x -= 0.01;
            } else {
                isAtPoint ++;
            }
            if (wd.y < nextPoint.y - 0.05) {
                wd.y += 0.01;
            } else if (wd.y > nextPoint.y + 0.05) {
                wd.y -= 0.01;
            } else {
                isAtPoint ++;
            }

            if (isAtPoint == 2) {
                wd.step ++;
            }
        } else {
            toRemove.push[i];
        }
    }
    for (var a in toRemove) {
        wifiDevices.splice(toRemove[a], 1);
    }
}

function randomAddress() {
  return addresses[Math.floor(Math.random()*addresses.length)];
}

function payloadForNode(node) {
    var payload = {date: new Date().toJSON(), hits: []};
    for (var i in wifiDevices) {
        var wd = wifiDevices[i];
		var d = Math.sqrt(Math.pow(node.x - wd.x, 2) + Math.pow(node.y - wd.y, 2));
        if (d < node.range) {
            var strength = -(100 - (d / node.range) * 100);
            payload.hits.push(strength);
        }
    }
    return payload;
}

function randomPayload() {
    var payload = {date: new Date().toJSON(), hits: []};
    var hitCount = 20 * Math.random();
    for (var i = 0; i < hitCount; i ++) {
        var strength = Math.round(-100 * Math.random());
        payload.hits.push(strength);
    }
    return payload;
}

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');

    // Create a message and send it to the IoT Hub every second
    setInterval(function(){
      var address = randomAddress();
      var date = new Date().toJSON();
      var payload = [];
      for (var i in nodes) {
          payload.push({ deviceId: nodes[i].id, payload: payloadForNode(nodes[i])});
      }
      var data = JSON.stringify(payload);
      var message = new Message(data);
    //   console.log("Sending message: " + message.getData());
      client.sendEvent(message, printResultFor('send'));
      }, 100);

    setInterval(function() {
        updateWifiDevices();
    }, 10);
  }
};

client.open(connectCallback);
