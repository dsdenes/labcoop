var fs = require('fs');
var $ = require('jquery');
var _ = require('underscore');
var path = require('path');

var App = require('app');
var debug = App.debugFactory('snippet:adminItems:layout');

var LayoutViewAdminList = require('../../lib/layouts/admin-list');

var ItemCollection = require('../../model/items').Collection;
var ItemModel = require('../../model/items').Model;
var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var itemTemplate = fs.readFileSync(path.join(__dirname, 'model.html'), 'utf8');
var collectionTemplate = fs.readFileSync(path.join(__dirname, 'collection.html'), 'utf8');

var LayoutView = LayoutViewAdminList({
  addUrl: 'admin/item/add',
  editUrl: 'admin/item/edit',
  imagePath: 'item-images',
  collection: ItemCollection,
  model: ItemModel,
  apiName: 'items',  
  layoutTemplate: layoutTemplate,
  collectionTemplate: collectionTemplate,
  itemTemplate: itemTemplate,
  loadImagesToCell: 1
});

module.exports = LayoutView;