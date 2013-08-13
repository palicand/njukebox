var host = "http://localhost";

var socket = io.connect(host);
var library = {};
var playlist = {};
var mpdStatus = {};
socket.on("list artist", function(data) {
	//data = JSON.parse(data);

	if(data.result != "OK") {
		alert("something went wrong");
	}

	insertArtists(data.data);


	var libHTML = libraryTemplate(data);
	$("#library ul").html(libHTML);
	$("#library ul li").click(function() {
		emitCommand("list album", {"artist":$(this).text()});
	});
});


socket.on("list album", function(data) {
	//data = JSON.parse(data);
	var albumHTML = albumTemplate(data);
	$("#albums").html(albumHTML);
	$("#albums li").click(function() {
		emitCommand("search album", {"artist":$(this).text()});
	});
});

socket.on("search album", function(data) {
	//data = JSON.parse(data);
	//console.log(data);
	var songHTML = songsTemplate(data);
	$("#songs ul").html(songHTML);
	$("#songs ul li").click(function() {
		emitCommand("add", {"uri":""})
	});
});

socket.on("playlistinfo", function(data) {
	playlist = data;
});

socket.on("status", function(data) {
	mpdStatus = data;
});

function insertArtists(data) {
	for(var artistIndex in data) {
		if(!(data[artistIndex].Artist in library)) {
			library[data[artistIndex].Artist] = null;
		}
	}
}

function emitCommand(command, data) {
	socket.emit("command", {"command":command, "arguments":data});
}

emitCommand("list artist");
emitCommand("status");
emitCommand("playlistinfo");