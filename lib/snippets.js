/**
 * This file must stay ES5 until require-globify doesn't parse ES6 
 **/

var Handlebars = require('handlebars');
var $ = require('jquery');
var path = require('path');
var App = require('../app');

module.exports = new (function() {

  var _this = this;
  _this.snippetHashes = {};
  _this.snippets = [];

  var initSnippet = function(snippetHash) {

    _this.snippets.push({
      //id: snippetHash.id,
      router: snippetHash.Router ? snippetHash.Router() : null,
      controller: snippetHash.Controller ? snippetHash.Controller() : null,
      layout: snippetHash.Layout ? snippetHash.Layout() : null
    });

  }

  this.init = function() {

    _this.snippetHashes = require('../snippets/**/index.js', { mode: 'hash' });

    for (var k in _this.snippetHashes) {
      initSnippet(_this.snippetHashes[k]);
    }

    return _this;
  }

})();

/*
import App from 'app';
import Handlebars from 'handlebars';
import $ from 'jquery';
import q from 'q';
import co from 'co';

class SnippetHandler {

  constructor() {
    this.snippets = [];
  }

  initSnippet(snippetHash) {

    this.snippets.push({
      //id: snippetHash.id,
      router: snippetHash.router ? snippetHash.router() : null,
      controller: snippetHash.controller ? snippetHash.controller() : null,
      layout: snippetHash.layout ? snippetHash.layout() : null
    });  
    
    return this;
  }
  
  init() {

    // in favour of globby
    //const snippetHashes = require('../snippets/*index.js', { mode: 'hash' });
    
    for (let snippetHash of snippetHashes) {
      this.initSnippet(snippetHash);
    }
    
    return this;
    
  }
}

export default new SnippetHandler();

*/