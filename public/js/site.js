site = new Site();
var socket;

window.onload = function() {
//	socket = io.connect('')
	site.init();
}

function Site() {
	this.init = function() {
		this.ec = new ElementCreator();
		this.ee = new ElementEditor();
		this.el = new EventListener();
		this.ap = new AtlasPool();

		this.document_elements = {};
		this.document_elements['sidebar'] = document.getElementById('sidebar');

		this.createMainMenu();
		this.constructSite('main');
/*		this.getRessources();
		this.createHighscoreMenu();
		this.getRessources();*/
	}

	this.constructSite = function(siteMode) {
		this.document_elements['sidebar'] = this.ee.removeChildList(this.document_elements['sidebar']);

		if(siteMode == 'main') {
			this.document_elements['sidebar'].appendChild(this.document_elements['main_menu']);
		} else if(siteMode == 'play') {

		} else if(siteMode == 'editor') {
			for(var key in this.document_elements['editor_menu']) {
				this.document_elements['sidebar'].appendChild(this.document_elements['editor_menu'][key]);
			}
		} else if(siteMode == 'highscore') {

		}
	}

	this.createMainMenu = function() {
		var parent = this.ec.create('div', null, null, ['btn-group-vertical', 'btn-block']);
		var childs = [];
		childs[0] = this.ec.create('button', 'START GAME', 'start_game', ['btn', 'btn-success']);
		childs[1] = this.ec.create('button', 'START EDITOR', 'start_editor', ['btn', 'btn-primary']);
		childs[2] = this.ec.create('button', 'SHOW HIGHSCORES', 'show_highscore', ['btn', 'btn-primary']);

		childs = this.ee.appendListener(childs, 'button');

		parent = this.ee.appendChildList(parent, childs);

		this.document_elements['main_menu'] = parent;
	}

	this.createEditorMenu = function() {
		this.document_elements['editor_menu'] = {};
		for(var list in editor.itemPool.atlases) {
			var actualAtlas = editor.itemPool.atlases[list];

			var panel = this.ec.create('div', null, null, ['panel']);
			var toggle = this.ec.create('a', list.capitalize(), null, ['btn', 'btn-primary', 'form-control']);
			var attributes = {
				'data-toggle' : 'collapse',
				'data-target' : '#'+list,
				'data-parent' : '#sidebar',
				'href' : '#'
			}
			toggle = this.ec.changeAttribute(toggle, attributes);
			var collapse = this.ec.create('div', null, list, ['collapse']);
			var ul = this.ec.create('ul', null, null, ['nav', 'nav-pills','nav-stacked']);
			var li = [];

			for(var name in actualAtlas) {
				var l = this.ec.create('li');
				var a = this.ec.create('a', name.capitalize(), null, ['item']);
				var attributes = {
					'href' : '#',
					'data-item-name' : name,
					'data-list-name' : list
				};

				a = this.ec.changeAttribute(a, attributes);
				var e = this.ee.appendListener([a], 'button');
				a = e[0];

				l.appendChild(a);
				li.push(l);
			}

			ul = this.ee.appendChildList(ul, li);
			collapse.appendChild(ul);
			panel = this.ee.appendChildList(panel, [toggle, collapse]);

			this.document_elements['editor_menu'][list] = panel;
		}
		this.constructSite('editor');
	}

	this.createHighscoreMenu = function() {

	}
	
	this.getRessources = function() {
		socket.emit('getAtlas');

		//Nun schickt uns der Server nach und nach die Atlas Dateien, welche sofort in ein Array gespeichert werden...
		socket.on('sendAtlas', function(data){
			for(var i = 0; i < data.length; i++) {
				site.ap.addAtlas(data[i].key, data[i].frames);
			}

			game.init();
		});
	}

	this.loading = function(percentage) {
		var progressBar = document.getElementById('progressbar');
		var css = {
			'width' : percentage+'%'
		}
		progressBar = this.ec.appendCss(progressBar, css);
	}

	this.doneLoading = function() {
		var progressDiv = document.getElementById('progress');
		var progressBar = document.getElementById('progressbar');
		var css = {
			'width' : '0%'
		}
		progressDiv = site.ec.removeCssClass(progressDiv);
		progressDiv = site.ec.appendCssClass(progressDiv, ['navbar', 'hide']);
		progressBar = site.ec.appendCss(progressBar, css);

		site.createEditorMenu();
	}
}

function AtlasPool() {
	this.atlases = [];

	this.addAtlas = function(key, atlas) {
		this.atlases[key] = atlas;
	}

	this.removeAtlas = function(key) {
		delete this.atlases[key];
	}

	this.getAtlas = function(key) {
		return this.atlases[key];
	}

	this.getAtlases = function() {
		return this.atlases;
	}
}

function ElementCreator() {

	this.create = function(element, text, id, cssClass, css) {
		var e = document.createElement(element);
		if(text) {
			e.innerHTML = text;
		}

		if(id) {
			e = this.appendID(e, id);
		}

		if(cssClass && cssClass.length > 0) {
			e = this.appendCssClass(e, cssClass);
		}

		if(css && css.length > 0) {
			e = this.appendCss(e, css);
		}

		return e;
	}

	this.changeAttribute = function(element, attribute) {
		for(var key in attribute) {
			element.setAttribute(key, attribute[key]);
		}

		return element;
	}
	
	this.appendID = function(element, id) {
		element.id = id;
		return element;
	}

	this.appendCssClass = function(element, cssClass) {
		for(var i = 0; i < cssClass.length; i++) {
			element.className += cssClass[i]+' ';
		}

		return element;
	}

	this.removeCssClass = function(element) {
		element.className = '';

		return element;
	}

	this.appendCss = function(element, css) {
		for(var key in css) {
			element.style[key] = css[key];
		}

		return element;
	}
}

function ElementEditor() {
	this.appendChildList = function(element, childList) {
		for(var i = 0; i < childList.length; i++) {
			element.appendChild(childList[i]);
		}

		return element;
	}

	this.removeChildList = function(element) {
		var childList = element.children;
		for(var i = childList.length-1; i >= 0; i--) {
			if(childList[i].parentNode == element) {
				element.removeChild(childList[i]);
			}
		}

		return element;
	}

	this.appendListener = function(elementList, listenerType) {
		for(var i = 0; i < elementList.length; i++) {
			if(listenerType == 'button') {
				elementList[i].addEventListener('click', site.el.buttonClick, false);
			} else if(listenerType == 'mouseOver') {
				elementList[i].addEventListener('mouseover', site.el.mouseOver, false);
			} else if(listenerType == 'mouseClick') {
				elementList[i].addEventListener('click', site.el.mouseClick, false);
			}
		}

		return elementList;
	}
}

function EventListener() {
	this.mouseOver = function(e) {
		console.log(e.target);
	}

	this.buttonClick = function(e) {
		var src = e.target;

		if(src.id == site.document_elements['main_menu'].children[0].id) { //Play the actual game
			console.log('Starting game...');
		} else if(src.id == site.document_elements['main_menu'].children[1].id) { //Start the Level Editor
			editor.init();
		}

		if(src.className == 'item ') {
			editor.addElementToGrid(src.getAttribute('data-list-name'), src.getAttribute('data-item-name'));
		}

		e.preventDefault();
	}

	this.mouseClick = function(e) {
		var mouse = getMousePos(e);

		var css = {
			'left' : mouse.x+'px',
			'top' : mouse.y+'px'
		}

		e.preventDefault();
	}
}

var getMousePos = function(e) {
	var mouse = {
		x : Number,
		y : Number,
		x_world : Number,
		y_world : Number
	};

	var rect = document.getElementById('game').getBoundingClientRect();

	if(e.x != undefined && e.y != undefined) {
		var x = e.x;
		var y = e.y;
	} else {
		var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	mouse.x_world = x;
	mouse.y_world = y;

	mouse.x = Math.floor(x - rect.left);
	mouse.y = y - rect.top;

	return mouse;
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}


		/*	JSON Objekt aufgebaut aus :
			data.key == Bildname (e.g. "tiles", "hud", etc.)
			data.frames[] = Enthält die eigentlichen Frame Objekte die wie folgt aufgebaut sind:
				data.frames.filename = Name der Datei
				data.frames.frame = Objekt mit folgendem Inhalt	:
					data.frames.frame.x = X-Position,
					data.frames.frame.y = Y-Position,
					data.frames.frame.w = Width des Sprites,
					data.frames.frame.h = Height des Sprites
				****Weitere aber vorerst unwichtige Infos: ****
				data.frames.rotated = True/False ob rotiert oder nicht
				data.frames.trimmed = True/False ob trimmed oder nicht
				data.frames.spriteSourceSize = Information zu originalen Größe des Bildes (x/y = 0, w, h)
				data.frames.sourceSize = w, h ... keine weiteren Informationen
			WICHTIG !! : Nach verarbeiten  ZUGRIFF -->
				this.atlases[<atlas_name>][<id (max = anzahl_sprites)>] = {
					filename = String,
					frame = {
						x = Number,
						y = Number,
						w = Number,
						h = Number
					}
				}
			**** E.G.: this.atlases['tiles'][0].filename = box ****



	this.createMainMenu = function() {
		var parent = this.ec.create('div', null, 'main_menu', ['btn-group-vertical']);

		var childs = [];
		childs[0] = this.ec.create('button', 'Play Game', 'play_game', ['btn', 'btn-success']);
		childs[1] = this.ec.create('button', 'Editor', 'editor', ['btn', 'btn-primary']);
		childs[2] = this.ec.create('button', 'Highscores', 'highscores', ['btn', 'btn-primary']);

		childs = this.ee.appendListener(childs, 'button');
		parent = this.ee.appendChildList(parent, childs);
		this.document_elements.div['main_menu'] = parent;
	}

	this.createEditorMenu = function() {
		// Editor Menu besteht aus 2 Unterpunkten : Elemente wählen // Ebene wählen == damit kombiniert Liste der Elemente...
		var css = {
			'position' : 'absolute'
		};

		var parent = this.ec.create('div', null, 'editor_menu', ['btn-group-vertical'], null, css);

		var childs = [];
		childs[0] = this.ec.create('button', 'Element', 'element', ['btn', 'btn-primary']);
		childs[1] = this.ec.create('button', 'Ebene', 'ebene', ['btn', 'btn-primary']);

		childs = this.ee.appendListener(childs, 'mouseOver');
		parent = this.ee.appendChildList(parent, childs);
		this.document_elements.div['editor_menu'] = parent;
		this.document_elements.div['editor_menu']['childs'] = childs;
	}
		*/