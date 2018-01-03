"use strict";
class Import {
	constructor(target){
		this.target = target || document.head;
		this.registry = {
			scripts: {},
			dependance: {}
		};
	}
	/*
	scripts
	{
		"nickname": {
			path: "filePath",
			dependance: [],
			sync: true,
		},
		"nick": "fPath",
		"nick": ["path", "d1", "d2"],
		...
	}
	dependancies
	{
		"main": ["nick", "nick2", ...],
		...
	}
	*/
	register(scripts, dependance) {
		for(let a in scripts) {
			if(a in this.registry.scripts) {
				throw new Error(`Script name ${a} already exists`);
				return;
			}
			let path, d, async = false;
			if(typeof scripts[a] == "string") {
				path = scripts[a];
				d = [];
			} else if(scripts[a] instanceof Array) {
				path = scripts[a][0];
				d = scripts[a].slice(1);
			} else {
				path = scripts[a].path;
				d = scripts[a].dependance || [];
				if(scripts[a].sync) {
					async = true;
				}
			}
			this.registry.scripts[a] = {
				path,
				async,
				dependance: d,
				importing: false,
				imported: false,
				callbacks: []
			};
		}
		for(let a in dependance) {
			if(a in this.registry.dependance) {
				throw new Error(`Dependance set for ${a} already exists`);
				return;
			}
			this.registry.dependance[a] = dependance[a];
		}
		// TODO: dependancy loop detection?
	}
	// Calllback arguments:
	// (status) => {}
	// status:
	// 		0 just css loaded
	// 		1 just js loaded
	//		2 everything loaded
	// TODO: enum
	importDependancies(dependanceSet, callback, allAtOnce) {
		// TODO: idiot proof
		let dependancies = this.registry.dependance[dependanceSet],
			numDependancies = dependancies.length,
			dependanciesLoaded = 0;
		// Import each dependancy from the set
		// TODO idiot proof for 0 dependancies
		for(let a of dependancies) {
			this.importDependancy(a, () => {
				if(++dependanciesLoaded == numDependancies){
					callback();
				}
			}, allAtOnce);
		}
	}
	importDependancy(dependancy, callback, allAtOnce) {
		// Ensure all dependancies are imported
		let script = this.registry.scripts[dependancy];
		let dependancies = script.dependance.length,
			dependanciesIncluded = 0;
		let importCb;
		if(script.async) {
			this.load(this.registry.scripts[dependancy]);
			for(let a of script.dependance) {
				let dep = this.registry.scripts[a];
				if(!(dep.imported || dep.importing)) {
					this.importDependancy(a);
				}
			}
			callback();
		} else {
			if(allAtOnce) {
				// Then don't wait before loading the dependancy itself
				dependancies++;
				importCb = () => {
				   if(++dependanciesIncluded == dependancies || dependancies == 0) {
					   // Now load that all the dependancy's dependancies are loaded load the dependancy itself
					   callback && callback();
				   }
			   };
			   this.load(this.registry.scripts[dependancy], importCb);
			} else {
				importCb = () => {
				   if(++dependanciesIncluded == dependancies || dependancies == 0) {
					   // Now load that all the dependancy's dependancies are loaded load the dependancy itself
					   this.load(this.registry.scripts[dependancy], () => {
						   callback && callback();
					   });
				   }
			   };
			}
			if(dependancies == 0) {
				importCb();
			} else {
				for(let a of script.dependance) {
					let dep = this.registry.scripts[a];
					if(dep.imported) {
						importCb();
					} else if(dep.importing) { // some sort of bug related to this?
						dep.callbacks.push(importCb);
					} else {
						//this.load(dep, importCb);
						this.importDependancy(a, importCb);
					}
				}
			}
		}
	}
	load(file, callback) {
		// else import
		let cb = () => {
			file.imported = true;
			while(file.callbacks.length > 0) {
				file.callbacks[0]();
				file.callbacks.shift();
			}
		};
		file.importing = true;
		callback && file.callbacks.push(callback);
		/*if(file.path.endsWith(".css")) {
			this.loadCss(file.path, cb);
		} else if(file.path.endsWith(".js")) {
			this.loadJs(file.path, cb);
		} else {
			throw new Error("Unknown file extention for " + file.path);
		}*/
		if(file.path.endsWith(".js")) {
			this.loadJs(file.path, cb);
		} else {
			this.loadCss(file.path, cb);
		}
	}
	loadCss(file, callback){
		let e = document.createElement("link");
		e.setAttribute("rel", "stylesheet");
		//e.setAttribute("type", "text/css");
		e.setAttribute("href", file);
		callback && e.addEventListener("load", callback, false);
		this.target.appendChild(e);
	}
	loadJs(file, callback){
		var e = document.createElement('script');
        e.setAttribute("src", file);
		e.setAttribute("type", "text/javascript");
		// If callback isn't undefined then add the callback
		callback && e.addEventListener("load", callback, false);
        this.target.appendChild(e);
	}
}
