var net = require('net');
var events = require('events');
var mpdClient = null;

function parseData(data) {
	var dataArray = data.split("\n");
	var result = [];
	var batch = {};
	var result = [];
	var item = {};

	batch["data"] = [];
	for(var i = 0; i < dataArray.length; ++i) {
		if(dataArray[i].search(/^OK$/) != -1 ||  
			dataArray[i].search(/^ACK/) != -1) //we have a result line
		{
			batch["result"] = dataArray[i];
			batch["data"].push(item);
			item = {};

			result.push(batch);
			batch = {};
			batch["data"] = [];
		} else {
			var pair = dataArray[i].split(": ");
			if(isDelimiting(pair[0])  && pair[0] in item) {
				//console.log("batch already contains " + pair[0]);
				batch["data"].push(item);
				item = {};
			}
			item[pair[0]] = pair[1];
		}

	}
	return result;
}

function isDelimiting(tag) {
	if(tag == "file" || tag == "Artist" || tag == "Album" || tag == "Title" || tag == "Track" || tag == "Genre") {
		return true;
	} else {
		return false;
	}
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
			cmd += " \"" + arguments[argument] + "\"";
		}
		this.commandQueue.push(cmd);
		this.emitter.once(cmd, callback);
		var self = this;
		console.log("sending command " + cmd);
		this.client.write(cmd + "\n");
	}
}


exports.connect = function(config, callback) {
	if(mpdClient != null) {
		return mpdClient;
	}
	mpdClient = new mpd(config);
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
		//console.log("raw data:\n" + data);
		if(mpdClient.commandQueue.length == 0) {
			return;
		}
		var parsedData = parseData(data.toString());
		//console.log(parsedData);
		for(var datum in parsedData) {
			//console.log("parsed data: " + parsedData[datum]);
			var command = mpdClient.commandQueue.shift();
			//console.log("popped " + command);
			mpdClient.emitter.emit(command, parsedData[datum]);
		}
	});

	mpdClient.client.on("error", function(data) {
		console.log("there was an error" + data);
	});
	return mpdClient;
}