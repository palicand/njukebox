var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var fs = require('fs');
var handlers = require('./handlers');
var routes;
var mpd = require('./mpd');
exports.start = function(port) {
	setUpMiddleware();
	//createParams();
	createRoutes();
	setupSocketIO();
	server.listen(port);
}

function createRoutes() {
	var fileContent = fs.readFileSync("./lib/routes.json");
	routes = JSON.parse(fileContent)
	console.info(routes);
	for(var verb in routes) {
		createRoute(verb, routes[verb]);
	}
}

function createParams() {
	app.param("command", function(req, res, next, cmd) {
	});
}

function setUpMiddleware() {
	app.use(express.logger());
	app.use(express.compress());
	app.use(express.bodyParser());
}

function createRoute(verb, routes) {
	for(var route in routes) {
		var handlersArr = [];
		for(var handler in routes[route]["handlers"]) {
			if(!(routes[route]["handlers"][handler] in handlers)) {
				console.error("the handler " + routes[route]["handlers"][handler] + " wasn't defined");
			} else {
				handlersArr.push(handlers[routes[route]["handlers"][handler]]);
			}
		}
		if(routes[route].regexp) {
			console.log(routes[route]["path"] + " is regex");
			app[verb](new RegExp(routes[route]["path"]), handlersArr);
		}
		else {
			console.log(routes[route]["path"] + " is not regex");
			app[verb](routes[route]["path"], handlersArr);
		}

	}
}

function setupSocketIO() {
	io.sockets.on("connection", function(socket) {
		var mpdClient = mpd.connect({"host":"localhost", "port":"6600"}, function() {
			console.log("connected from socket");

		});
		/*mpdClient.sendCommand("list", {"tag":"artist"}, function(data) { 
			socket.emit("list artist", data);
		});*/

		socket.on("command", function(args) {
		var mpdClient = mpd.connect({"host":"localhost", "port":"6600"}, function() {
		});
		console.log("received command " + args.command + " with arguments " + args.arguments);
		mpdClient.sendCommand(args.command, args.arguments, function(data) {
			socket.emit(args.command, data)
		});

	});
	});

	
}


