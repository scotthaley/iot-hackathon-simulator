
module.exports = (function() {
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

    var people = [
        {x: 9, y: 2.5, path: [
        	{x: 7, y: 2.5}, {x: 7, y: -6}, {x: -8, y: -6}, {x: -8, y: 6}
        ]}
    ]

    function randomPerson() {
        var master = people[Math.floor(Math.random() * people.length)];
        var newPerson = {
            x: master.x,
            y: master.y,
            step: 0,
            path: master.path
        }
        return newPerson;
    }

    function createPerson() {
        wifiDevices.push(randomPerson());
    }

    var wifiDevices = [
    ]

    function updateWifiDevices() {
        var toRemove = [];
        for (var i in wifiDevices) {
            var toR = updateSingleDevice(i);
            if (toR) {
                toRemove.push(i);
            }
        }
        for (var a in toRemove) {
            wifiDevices.splice(toRemove[a], 1);
        }
    }

    function updateSingleDevice(index) {
        var wd = wifiDevices[index];
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
            return index;
        }
        return null;
    }

    function payloadForNode(node) {
        var payload = {date: new Date().toJSON(), hits: []};
        for (var i in wifiDevices) {
            var wd = wifiDevices[i];
    		var d = Math.sqrt(Math.pow(node.x - wd.x, 2) + Math.pow(node.y - wd.y, 2));
            if (d < node.range) {
                var strength = Math.round(-(100 - (d / node.range) * 100));
                payload.hits.push(strength);
            }
        }
        return payload;
    }

    function beginSimulation() {
        setInterval(function() {
            updateWifiDevices();
        }, 10);

        // createPerson();

        setInterval(function() {
            createPerson();
        }, 5000);
    }

    function payload() {
        var payload = [];
        for (var i in nodes) {
            payload.push({ deviceId: nodes[i].id, payload: payloadForNode(nodes[i])});
        }
        return payload;
    }

    return {
        // public stuff
        beginSimulation: beginSimulation,
        payload: payload
    }
})();
