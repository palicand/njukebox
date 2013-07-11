var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var fs = require('fs');
var handlers = require('./handlers')
var routes, io;
exports.start = function(port) {
	setUpMiddleware();
	//createParams();
	createRoutes();
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
		app[verb](routes[route]["path"], handlersArr);
	}
}
