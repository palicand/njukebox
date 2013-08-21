var songs = [];
var playlist = {};
var mpdStatus = {};
var selectedSong = 0;
socket = io.connect("localhost");

socket.on("list artist", function(data) {
	//data = JSON.parse(data);

	if(data.result != "OK") {
		alert("something went wrong");
	}

	var libHTML = libraryTemplate(data.data);
	$("#library ul").html(libHTML);
	$("#library ul li").click(function() {
		emitCommand("list album", {"artist":$(this).text()});
	});
});


socket.on("list album", function(data) {
	//data = JSON.parse(data);
	var albumHTML = albumTemplate(data.data);
	$("#albums").html(albumHTML);
	$("#albums li").click(function() {
		emitCommand("search album", {"artist":$(this).text()});
	});
});

socket.on("search album", function(data) {
	//data = JSON.parse(data);
	//console.log(data);
	songs = data.data;
	var songHTML = songsTemplate(data.data);
	$("#songs ul").html(songHTML);
	$("#songs ul li").click(function() {
		var idPair = $(this).attr("id").split("-");
		emitCommand("add", {"uri":songs[parseInt(idPair[1])].file});
		emitCommand("playlistinfo");
	});
});

socket.on("playlistinfo", function(data) {
	var playlistHTML = playlistTemplate(data.data);
	playlist = data;
	$("#playlist ul").html(playlistHTML);
	$("#playlist ul li").click(function() {
		var siblings = $(this).addClass("selected").siblings().removeClass('selected');
		selectedSong = $(this).index();
	});
});

socket.on("status", function(data) {
	if(data.result == "OK") {
		mpdStatus = data.data[0];
		if(mpdStatus["state"] == "play") {
			$("#play").text("Stop");
		} else if(mpdStatus["state"] == "stop" || mpdStatus["state"] == "pause") {
			$("#play").text("Play");
		} else {
			$("#play").text("Unavailable");
		}
	} else {
		//handle error
	}
});

function insertArtists(data) {
	for(var artistIndex in data) {
		if(!(data[artistIndex].Artist in library)) {
			library[data[artistIndex].Artist] = null;
		}
	}
}

function emitCommand(command, data, callback) {
	console.log("emitting " + command + " " + JSON.stringify(data));
	socket.emit("command", {"command":command, "arguments":data});
	if(typeof(callback) != "undefined") {
		socket.once(command, callback, data);
	}
} 

emitCommand("list artist");
emitCommand("status");
emitCommand("playlistinfo");


$(document).ready(function() {
	$("#play").click(function() {
		if(mpdStatus["state"] != "play") {
			emitCommand("play", selectedSong.toString());
			$(this).text("Play");
			emitCommand("status");

		} else {
			emitCommand("stop");
			$(this).text("Stop");
			emitCommand("status");		
		}
	});
});