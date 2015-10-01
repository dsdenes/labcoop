var Handlebars = require('handlebars');
var $ = require('jquery');
var path = require('path');
var App = require('../app');

module.exports = new (function() {
  
  var _this = this;
  _this.snippetHashes = {};
  _this.snippets = [];

  var initSnippet = function(snippetHash) {
    
    var snippet = new (snippetHash.init)(App);

    _this.snippets.push({
      id: snippetHash.id,
      obj: snippet,
      router: snippetHash.router ? snippetHash.router() : null,
      controller: snippetHash.controller ? snippetHash.controller() : null,
      layout: snippetHash.layout ? snippetHash.layout() : null
    });
     
  }
  
  // templates rendered
  this.afterDOM = function() {
    _this.snippets.map(function(snippet) {
      
      //var wrapper = $('#' + snippet.name).eq(0);
      snippet.obj.afterDOM && snippet.obj.afterDOM();
      
    });
    return _this;
  }
  
  this.init = function() {

    _this.snippetHashes = require('../snippets/**/index.js', { mode: 'hash' });
    
    for (var k in _this.snippetHashes) {
      initSnippet(_this.snippetHashes[k]);
    }
    
    return _this;
  }
  
})();
