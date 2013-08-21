var libraryTemplate = doT.template("{{~it :value:index}}" +
									"<li>{{=value.Artist}}</li>" + 
									"{{~}}");

var albumTemplate = doT.template("{{~it :value:index}}"+
								"<li>{{=value.Album}}</li>" + 
								"{{~}}");

var songsTemplate = doT.template("{{~it :value:index}}"+
								"<li id=song-{{=index}}>{{=value.Title}}</li>" + 
								"{{~}}");

var playlistTemplate = doT.template("{{~it :value:index}}" +
									"<li>{{=value.Artist}} - {{=value.Title}}</li>" +
									"{{~}}");
