var mpd = require('./mpd');
var fs = require('fs');
var mpdClient = mpd.connect({"host":"localhost","port":6600}, function() {
	console.log("connected to mpd");
})
exports.handleMPD = function (req, res) {
	console.log("handling mpd command " + req.command);
	console.log("query " + req.query);
	mpdClient.sendCommand(req.params.command, req.query, function(data) {
		res.json(JSON.stringify(data));
	});
}

exports.handleStatic = function(req, res) {
	var expr = /\/api/;
	if(req.path == '' || req.path == "/") {
		sendFile('/index.html', res);
	} else if(!expr.test(req.path)) {
		sendFile(req.path, res);
	}
}

var sendFile = function(path, res) {
	if(!("cache" in sendFile)) {
		sendFile.cache  = {};
	}
	if(!(path in sendFile.cache)) {
		fs.readFile("./static" + path, {"encoding":"utf8"} ,function(err, data) {
			if(err) {
				res.send(404, "No such file " + path);
			} else {
				sendFile.cache[path] = data;
				res.send(200, data);
			}
		});
	} else {
		res.send(200, sendFile.cache[path]);
	}
};