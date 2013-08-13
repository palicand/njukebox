var libraryTemplate = doT.template("{{~it.data :value:index}}" +
									"<li>{{=value.Artist}}</li>" + 
									"{{~}}");

var albumTemplate = doT.template("{{~it.data :value:index}}"+
								"<li>{{=value.Album}}</li>" + 
								"{{~}}");

var songsTemplate = doT.template("{{~it.data :value:index}}"+
								"<li>{{=value.Title}}</li>" + 
								"{{~}}");