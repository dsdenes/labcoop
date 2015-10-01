var mongoose = require('mongoose');
var q = require('q');
var _ = require('underscore');
//var autoIncrement = require('mongoose-auto-increment');

var l = require('../logger');
var db = require('./db');

var schema = new mongoose.Schema({
  
  id:                       Number,
  vacancyId:                Number,

  applyUrl:                 String,
  creationDate:             Date,
  modificationDate:         Date,
  publicationStart:         Date,
  publicationEnd:           Date,

  titleInformation:         String,
  introInformation:         String,
  offerInformation:         String,
  
  requirementsInformation:  String,

  jobTitle:                 String,

  workLocation:             String,

  commitmentLevel:          String,
  contractType:             String,
  driverLicence:            String,
  experienceLevel:          String,
  functionLevel1:           String,
  functionLevel2:           String,

  province:                 String,
  province1:                String,
  workCountry:              String,

  languages:                Array,
  
  company: {
    id:                     Number,
    correspondenceName:     String
  },
  
  synced:                   Date

});

schema.index({
  titleInformation: 'text'
});

schema.statics.filter = function(filters) {

  var mongoFilter = {};
  
  if (filters.search) {
    mongoFilter.$text = { $search: filters.search, $language: 'english' }
  }
  
  if (filters.languages) {
    mongoFilter.languages = { $in: filters.languages };
  }

  if (filters.professionalAreas) {
    mongoFilter.functionLevel1 = { $in: filters.professionalAreas };
  }
  
  if (filters.experienceLevel) {
    mongoFilter.experienceLevel = { $in: filters.experienceLevel };
  }  
  
  return this
    .find(mongoFilter,
      { score: { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } });
}

schema.statics.filterByPublicationIds = function(ids) {
  return this
    .find({ id: { $in: ids }});
}

schema.statics.filterByVacancyIds = function(ids) {
  return this
    .find({ vacancyId: { $in: ids }});
}
module.exports = db.model('Job', schema);