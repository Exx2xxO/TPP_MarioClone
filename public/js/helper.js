var atlas = {};

function createJsonFile() {
	
}

function createChildNode(name, parent) {
	if(parent == null) atlas[name] = {};
	atlas[parent][name] = {};
}

function createJsonElement() {

	this.parentElement = function(name, childs) {

	}

	this.arrayElement = function(name, childs) {
		var arr = {};
		arr[name] = childs;
		console.log('JSON ELEMENT : '+JSON.stringify(arr));
	}

	this.singleElement = function(name, data) {

	}

}