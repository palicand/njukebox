var express = require('express');
var app = express();

exports.start = function() {
	app.listen(80);
}