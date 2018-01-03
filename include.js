/*!
 * include.js micro JavaScript Library v1.0
 * http://felisphasma.github.io/include.js/
 *
 * Includes SparkleQuery
 * http://felisphasma.github.io/SparkleQuery/
 *
 * Copyright 2015 FelisPhasma Under the MIT license
 */
(function(window, document, undefined){
	var defaults = {},
		version = "1.0",
		// Sparkle Query copyright FelisPhasma 2014 v2.0
		includeQuery = function(query, context){context = context == undefined ? document : context;return {"-1":function(q){return context.getElementsByTagName(q);},"0":function(q){return [context.getElementById(q.substr(1))];},"1":function(q){return context.getElementsByClassName(q.substr(1));}}[["#", "."].indexOf(query[0]).toString()](query);};
	if(typeof includejs !== "undefined")
		for(o in window.includejs)
			defaults[o] = window.includejs[o];
	function include(file, callback){
		return include[defaults.defaultMethod || "dynamic"].apply(this, arguments);	
	};
	include.dynamic = function(file, callback){
		var files = [].concat(file),
			callbacks = [].concat(Array.prototype.slice.call(arguments, 1));
		if(callbacks.length <= 0)
			callbacks = [function(){}];
		else
			callbacks = [].concat.apply([], callbacks);
		for(var i = 0, l = files.length; i < l; i++){
			var includeHolder = includeQuery(defaults["includeHolder"] || "head")[0],
				script = document.createElement("script");
			script.type = "text/javascript";
			script.src = files[i];
			script.onreadystatechange = callbacks[i % callbacks.length];
			script.onload = callbacks[i % callbacks.length];
			script.onerror = function(e){
				throw new Error("Error when including file: " + this.src);
				if(e.preventDefault)
					e.preventDefault();
				else
					e.returnValue = false;
			};
			includeHolder.appendChild(script);
		};
	};
	function ajax(url, callback){
		var xmlhttp;
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState==4 && (xmlhttp.status == 200 || xmlhttp.status == 304 || xmlhttp.status == 0)){
				try {
					eval(xmlhttp.responseText);
				} catch (e) {
					throw new Error("Include error when including " + url + ": " + e.message)
					if(e.preventDefault)
						e.preventDefault();
					else
						e.returnValue = false;
				}
				callback();
			}
		};
		xmlhttp.open("GET", url, defaults.ajaxAsync || true);
		xmlhttp.send();
	};
	include.ajax = function(file, callback){
		var files = [].concat(file),
			callbacks = [].concat(Array.prototype.slice.call(arguments, 1));
		if(callbacks.length <= 0)
			callbacks = [function(){}];
		else
			callbacks = [].concat.apply([], callbacks);
		for(var i = 0, l = files.length; i < l; i++)
			ajax(files[i], callbacks[i % callbacks.length]);
	};
	include.config = function(configDefaults){
		for(o in configDefaults)
			defaults[o] = configDefaults[o];
	};
	include.version = version;
	window.include = include;
})(window, document);