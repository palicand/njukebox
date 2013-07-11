var net = require('net');
var events = require('events');

function parseData(data) {
	var dataArray = data.split("\n");
	var result = {};
	result["data"] = [];
	var item = { };
	for(var i = 0; i < dataArray.length - 2; ++i) {
		var pair = dataArray[i].split(": ");
		if(pair[0] in item) {
			result["data"].push(item);
			item = {};
		}
		item[pair[0]] = pair[1];
	}
	result["result"] = dataArray[i];
	return JSON.stringify(result);
}

function mpd(config) {
	this.host = config["host"];
	this.port = config["port"];
	this.musicLibrary = config["musicLibrary"];
	this.connected = false;
	this.commandQueue = [];
	this.emitter = new events.EventEmitter();
}

mpd.prototype = {
	sendCommand: function(commandName, arguments, callback) {
		var cmd = "";
		cmd += commandName;
		for(var argument in arguments) {
			cmd += " " + arguments[argument];
		}
		this.commandQueue.push(cmd);
		this.emitter.once(cmd, callback);
		var self = this;
				console.log("sending command " + cmd);
		this.client.write(cmd + "\n");
	}
}


exports.connect = function(config, callback) {
		var mpdClient = new mpd(config);
		mpdClient.client = net.connect(config,
		function() {
			console.log("Connected to " + mpdClient.host + ":" + mpdClient.port);
		});


		mpdClient.client.on("end", function() {
			console.log("the daemon ended the connection");
		});


		mpdClient.client.once("data", function(data) {
			var pattern = /^OK MPD [0-9]+.[0-9]+.[0-9]+\n$/;
			if(!pattern.test(data)) {
				throw "Bad Welcome String";
			} else {
				var versionPattern = /[0-9]+.[0-9]+.[0-9]+/;
				mpdClient.version = versionPattern.exec(data);
				console.log("protocol version is " + mpdClient.version);
				mpdClient.connected = true;
				if(callback != undefined) {
					callback();
				}
			}
		});
		mpdClient.client.on("data", function(data) {
			console.log(data.toString());
			if(mpdClient.commandQueue.length == 0) {
				return;
			}
			var command = mpdClient.commandQueue.shift();
			var parsedData = parseData(data.toString());
			console.log("parsed data:\n" + parsedData);
			mpdClient.emitter.emit(command, parsedData);
			console.log("emitted " + command);
		});

		mpdClient.client.on("error", function() {
			console.log("there was an error");
		});
		return mpdClient;
	}