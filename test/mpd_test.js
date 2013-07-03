var mpd = require('../lib/mpd');
var assert = require('assert');
describe('mpd', function() {
	var mpdObj = {};
	beforeEach(function() {
		mpdObj = new mpd({
			host: "127.0.0.1",
			port: "6600",
			folder: "/var/lib/mpd/music"
		});
	});
	describe('.connect(callback)', function() {
		it("should connect to the mpd", function() {
			mpdObj.connect(function() {
				assert(mpdObj.connected);
			});
		});
	});

	describe('.sendCommand(callback)', function() {
		
	});

	describe('.state', function() {
		// body...
	})
})