var fs = require('fs');
var $ = require('jquery');
var _ = require('underscore');
var path = require('path');

var App = require('app');
var debug = App.debugFactory('snippet:adminContents:layout');

var LayoutViewAdminList = require('../../lib/layouts/admin-list');

var ItemCollection = require('../../model/contents').Collection;
var ItemModel = require('../../model/contents').Model;
var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');
var collectionTemplate = fs.readFileSync(path.join(__dirname, 'collection.html'), 'utf8');

var LayoutView = LayoutViewAdminList({
  addUrl: 'admin/content/add',
  editUrl: 'admin/content/edit',
  imagePath: 'content-images',
  collection: ItemCollection,
  model: ItemModel,
  apiName: 'contents',
  layoutTemplate: layoutTemplate,
  collectionTemplate: collectionTemplate,
  itemTemplate: itemTemplate
});

module.exports = LayoutView;
