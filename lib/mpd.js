var net = require('net');
var events = require('events');

function parseData(data) {
	var dataArray = data.split("\n");
	var result = [];
	var item = { };
	for(var i = 0; i < dataArray.length - 1; ++i) {
		var pair = dataArray[i].split(": ");
		if(pair[0] in item) {
			result.push(item);
			item = {};
		}
		item[pair[0]] = pair[1];
	}
	result.unshift({"result":item[i]});
	return result;
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
	connect: function(callback) {
		var self = this;
		this.client = net.connect({
			port: self.port,
			host: self.host
		}, 
		function() {
			console.log("Connected to " + self.host + ":" + self.port);	
		});

		this.client.once("data", function(data) {
			var pattern = /OK MPD [0-9]+.[0-9]+.[0-9]+/;
			if(!pattern.test(data)) {
				throw "Bad Welcome String";
			} else {
				var versionPattern = /[0-9]+.[0-9]+.[0-9]+/;
				self.version = versionPattern.exec(data);
				console.log("protocol version is " + self.version);
				self.connected = true;
				if(callback != "undefined") {
					callback();
				}
			}
		});

		this.client.on("data", function(data) {
			console.log(data.toString());
			var command = commandQueue.shift();
			var parsedData = parseData(data);
			this.emitter.emit(command, data);
		});
	},

	/*clearError: function() {
		this.client.write("clearerror");
	},

	currentSong: function(callback) {
		this.client.once("data", function(data) {
			var result = parseData(data);
			callback(data);
		});
		this.cliend.write("currentsong");
	}

	listAll: function(callback) {
		this.client.once("data", function(data)) {
			var result = [ ];
			var files = data.split("\n");
			for(file in files) {
				result.push(parseData(files[file]));
			}
		}
	}*/

	sendCommand: function(commandName, arguments, callback) {
		var cmd = commandName;
		for(var argument in arguments) {
			cmd += " " + arguments[argument];
		}
		this.emitter.once(cmd, callback);
		this.client.write(cmd);
	}
}


module.exports = mpd;
