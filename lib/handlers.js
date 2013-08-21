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
	fs.stat("./static" + path, function(err, stats) {
		if(err) {
			res.send(404, "No such file " + path);
			return;
		}
		if(!(path in sendFile.cache) || 
			stats.mtime.getTime() > sendFile.cache[path].mtime.getTime()) {
			fs.readFile("./static" + path, {"encoding":"utf8"} ,function(readErr, data) {
				sendFile.cache[path] = {"data":data, "mtime":stats.mtime};
				res.send(200, data);
			});
		} else {
			res.send(200, sendFile.cache[path].data);
		}
	});
};