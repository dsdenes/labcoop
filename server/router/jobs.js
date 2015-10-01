"use strict";

var express = require('express');
var router = express.Router();
var path = require('path');
var format = require('util').format;
var l = require('../logger').logger;
var response = require('../lib/response');
var isAuthenticatedMiddleware = require('../lib/auth').isAuthenticatedMiddleware;
var co = require('co');
var q = require('q');
var _ = require('underscore');
var request = require('request');
var url = require('url');
var xmlParser = require('xml2json');
var qs = require('qs');
var crypto = require('crypto');
var lodash = require('lodash');
var moment = require('moment');
var ProgressBar = require('progress');

var Memcached = require('memcached');
var cache = new Memcached('127.0.0.1:11211');

var Model = require('../db/jobs');

var execSync = require('child_process').execSync;

l.info(__filename);

var defaultFilters = {
  CRPublication: {
    company: process.env.CX_COMPANY_ID
  }
};

let parseAPICall = function(req) {
  
  let params = req.params[0].split('/');
  let filters = {};

  let filterValidators = {
    
    company: function(value) {
      return (!isNaN(parseFloat(value)) && isFinite(value));
    },
    language: function(value) {
      return ([9620,9621,9522,9623,9624,9625,9526,9627,9628,9629,9630,9631,9632,9633,9634,9635,9536,9537,9638,9539].indexOf(parseInt(value)) !== -1);
    },
    professionalAreas: function(value) {
      return (Array.isArray(value) && value.length);
    },
    experience: function(value) {
      return (['fresher', 'experienced', 'senior'].indexOf(value) !== -1);
    },
    search: function(value) {
      return value.match(/[a-z0-9\s]+/i);
    }

  };

  for (let i = 0; i < params.length; i+= 2) {

    try {

      let filterName = params[i];
      let filterValue = params[i+1];
      
      try {
        let tmp;
        Array.isArray((tmp = JSON.parse(filterValue))) && (filterValue = tmp);
      } catch (e) {}      

      if (!filterValidators[filterName](filterValue)) {
        throw '';
      }

      filters[filterName] = filterValue;

    } catch (e) {
      throw new Error('001 - Invalid API call.');
    } 

  } 
  
  return filters;
}

let callAPIEndpoint = function(endpoint, parameters) {
  
  return co(function* () {
    
    let url = format('%s?%s', endpoint, qs.stringify(parameters, { indices: false, encode: false }));
    
    let key = crypto.createHash('md5').update(url).digest("hex");

    let cacheres = yield q.ninvoke(cache, 'get', key);
    
    if (typeof cacheres !== 'undefined') {
      //console.log('CACHE: ' + url);
      return JSON.parse(cacheres);
    } else {
      console.log('GET: ' + url);
    }

    let options = {
      url: url,
      headers: {
        Authorization: 'Basic ' + process.env.CX_TOKEN
      }
    }
    
    let result = yield q.nfcall(request, options);
    
    let resultXML = result[0].body;
    
    let resultJSON = JSON.parse(xmlParser.toJson(resultXML));
    
    if (resultJSON.NSException) {
      throw new Error(resultJSON.NSException.reason);
    }
    
    let ttl;
    
    switch (true) {
      case (url.indexOf(process.env.CX_ENTITY_PUBLICATION) !== -1):
        ttl = Math.floor(Math.random() * 1800 - 900) + 900;
        break;
      case (url.indexOf(process.env.CX_ENTITY_VACANCY) !== -1):
        ttl = Math.floor(Math.random() * 1800 - 900) + 900;
        break;
      default:
        ttl = Math.floor(Math.random() * 86400 - 21600) + 21600;
        break;
    }
    
    cache.set(key, JSON.stringify(resultJSON), ttl, function(err) {
      //console.log('ERRR: ' + err);
    });

    return resultJSON;
    
  });
  
}

let callAPI = function(entity, parameters) {
  return callAPIEndpoint(process.env.CX_ENDPOINT + entity, parameters); 
}

let filterHiddenFunctions = function(func) {
  return !(func.isHidden || func.deleted || func.notActive);
}

let parseRawFunction = function(func) {
  return {
    id: func.dataNodeID,
    name: func.value
  };
}

let parseRawJob = function(jobRaw) {

  var job = {
    id:                       jobRaw.id,
    vacancyId:                jobRaw.toVacancy.CRVacancy.id,
    
    applyUrl:                 jobRaw.applyUrl,
    creationDate:             jobRaw.creationDate,
    modificationDate:         jobRaw.modificationDate,
    publicationStart:         jobRaw.publicationStart,
    publicationEnd:           jobRaw.publicationEnd,
    
    titleInformation:         jobRaw.vacancy.titleInformation,
    introInformation:         jobRaw.vacancy.introInformation,
    offerInformation:         jobRaw.vacancy.offerInformation,
    
    requirementsInformation:  jobRaw.requirementsInformation,
    
    //companyInformation:       jobRaw.companyInformation,
    jobTitle:                 jobRaw.vacancy.jobTitle,
    
    workLocation:             jobRaw.workLocation,
    //category:                 jobRaw.vacancy.category,
    commitmentLevel:          jobRaw.vacancy.commitmentLevel,
    contractType:             jobRaw.vacancy.contractType,
    driverLicence:            jobRaw.vacancy.driverLicence,
    experienceLevel:          jobRaw.vacancy.experienceLevel,
    functionLevel1:           jobRaw.vacancy.functionLevel1,
    functionLevel2:           jobRaw.vacancy.functionLevel2,
    
    province:                 jobRaw.vacancy.province,
    province1:                jobRaw.vacancy.province1,
    workCountry:              jobRaw.vacancy.workCountry,
    
    languages:                []
  };
  
  if (jobRaw.vacancy.company) {
    job.company = {
      id:                   jobRaw.vacancy.company.id,  
      //companyInformation:   jobRaw.vacancy.company.companyInformation,  
      correspondenceName:   jobRaw.vacancy.company.correspondenceName
    }
  }
  
  return job;

}

let getPublication = function(id) {
  return co(function* () {
    return (yield callAPI(format('%s/%d', process.env.CX_ENTITY_PUBLICATION, id), {})).CRPublication;
  });
}

let getPublicationList = function(parameters) {
  return co(function* () {
    if (!parameters.count) {
      parameters.count = 1000;
    }
    
    let res = (yield callAPI(process.env.CX_ENTITY_PUBLICATION + '/list', parameters)).array.CRPublication;
    
    if (!res) {
      return [];
    }
    
    return Array.isArray(res) ? res : [res];
  });
}

let getVacancy = function(id) {
  return co(function* () {
    return (yield callAPI(format('%s/%d', process.env.CX_ENTITY_VACANCY, id), {})).CRVacancy;
  });  
}

let getVacancyList = function(parameters) {
  return co(function* () {
    let res = (yield callAPI(process.env.CX_ENTITY_VACANCY + '/list', parameters)).array.CRVacancy;
    return Array.isArray(res) ? res : [res];
  });
}

let getCompany = function(id) {
  return co(function* () {
    return (yield callAPI(format('%s/%d', process.env.CX_ENTITY_COMPANY, id), {})).CRCompany;
  });  
}

let getDataNode = function(id) {
  
  if (!id) {
    return q("");
  }
    
  return co(function* () {
    var res = yield callAPI(format('%s/%d', process.env.CX_ENTITY_DATANODE, id), {});
    
    return (res).CRDataNode.value;
  });
}

let getDataNodeList = function(parameters) {
  return co(function* () {
    
    let dataNodeList = (yield callAPI(process.env.CX_ENTITY_DATANODE + '/list-by', parameters)).array.CRDataNode;
    
    return Array.isArray(dataNodeList) ? dataNodeList : [dataNodeList];
    
  });
}

let fetchPublicationNodes = function(publication, fetchNodeList) {

  return co(function* () {
    
    let todo = [];
    let result = {};

    for (let nodeName1 in fetchNodeList) {
      // nodeName1 == 'vacancy'
      
      if (typeof publication[nodeName1] !== 'undefined') {

        let dataNode1 = publication[nodeName1];

        for (let nodeName2 in fetchNodeList[nodeName1]) {
          // nodeName2 == 'CRDataNode'

          for (let nodeName3 of fetchNodeList[nodeName1][nodeName2]) {
            // nodeName3 == 'toCategoryNode'

            if (typeof dataNode1[nodeName3] !== 'undefined') {

              let dataNode2 = dataNode1[nodeName3];
              
              var normalizedNodeName = nodeName3.replace(/^to|node$/mgi, '');
              normalizedNodeName = normalizedNodeName.charAt(0).toLowerCase() + normalizedNodeName.slice(1);

              switch (nodeName2) {
                case 'CRDataNode':
                  todo.push((function(_nodeName1, _normalizedNodeName, id) {
  
                    result[_nodeName1] = result[_nodeName1] || {};
                    
                    return getDataNode(id)
                      .then(function(res) {
                        return (result[_nodeName1][_normalizedNodeName] = res); 
                      });
                    
                  })(nodeName1, normalizedNodeName, dataNode2.CRDataNode.id));
                break;
                case 'CRCompany':
                  todo.push((function(_nodeName1, _normalizedNodeName, id) {
                    
                    result[_nodeName1] = result[_nodeName1] || {};
                    
                    return getCompany(id)
                      .then(function(res) {
                        return (result[_nodeName1][_normalizedNodeName] = res); 
                      });
                    
                  })(nodeName1, normalizedNodeName, dataNode2.CRCompany.id));
                break;
              }
            }
          }
        }
      }
    }

    return yield q.all(todo)
      .then(function() {
        return result;
      });
    
  });    
}

let publicationToJob = function(publication, progress) {
  
  return co(function* () {
    
    var vacancy = yield getVacancy(publication.toVacancy.CRVacancy.id);
    
    var fetchNodeList = {
      vacancy: {
        CRDataNode: [
          'toCategoryNode',
          'toCommitmentLevelNode',
          'toContractTypeNode',
          'toDriverLicenceNode',
          'toExperienceLevelNode',
          'toFunctionLevel1',
          'toFunctionLevel2',
          'toProductNode',
          'toProductTypeNode',
          'toProvinceNode',
          'toProvince1Node',
          'toSalaryPeriodNode',
          'toWorkCountryNode',
          'toWorkLevelNode',
          'toWorkUnitNode'
        ],
        CRCompany : [
          'toCompany'
        ]
      }
    }
    
    publication.vacancy = vacancy;
    
    let dataNodes = yield fetchPublicationNodes(publication, fetchNodeList);
    
    /*
    let dataNodes = yield [
      getDataNode(vacancy.toCategoryNode.CRDataNode.id),          // 0
      getDataNode(vacancy.toCommitmentLevelNode.CRDataNode.id),   // 1
      getCompany(vacancy.toCompany.CRCompany.id),                 // 2
      getDataNode(vacancy.toContractTypeNode.CRDataNode.id),      // 3
      getDataNode(vacancy.toDriverLicenceNode.CRDataNode.id),     // 4
      getDataNode(vacancy.toExperienceLevelNode.CRDataNode.id),   // 5
      getDataNode(vacancy.toFunctionLevel1.CRDataNode.id),        // 6
      getDataNode(vacancy.toFunctionLevel2.CRDataNode.id),        // 7
      getDataNode(vacancy.toProductNode.CRDataNode.id),           // 8 
      getDataNode(vacancy.toProductTypeNode.CRDataNode.id),       // 9 
      getDataNode(vacancy.toProvinceNode.CRDataNode.id),          // 10
      getDataNode(vacancy.toProvince1Node.CRDataNode.id),         // 11
      getDataNode(vacancy.toSalaryPeriodNode.CRDataNode.id),      // 12
      getDataNode(vacancy.toWorkCountryNode.CRDataNode.id),       // 13
      getDataNode(vacancy.toWorkLevelNode.CRDataNode.id),         // 14
      getDataNode(vacancy.toWorkUnitNode.CRDataNode.id)           // 15
    ];*/

    /*
    vacancy.category          = dataNodes[0];
    vacancy.commitmentLevel   = dataNodes[1];
    vacancy.company           = dataNodes[2];
    vacancy.contractType      = dataNodes[3];
    vacancy.driverLicence     = dataNodes[4];
    vacancy.experienceLevel   = dataNodes[5];
    vacancy.functionLevel1    = dataNodes[6];
    vacancy.functionLevel2    = dataNodes[7];
    vacancy.product           = dataNodes[8];
    vacancy.productType       = dataNodes[9];
    vacancy.province          = dataNodes[10];
    vacancy.province1         = dataNodes[11];
    vacancy.salaryPeriod      = dataNodes[12];
    vacancy.workCountry       = dataNodes[13];
    vacancy.workLevel         = dataNodes[14];
    vacancy.workUnit          = dataNodes[15];*/
    

    publication = lodash.merge(publication, dataNodes);
    
    progress && progress.tick();
        
    //return publication;

    return parseRawJob(publication);
    
  });    
}

let getJob = function(id) {
  
  return co(function* () {
    
    let publication = yield getPublication(id);
    
    return publicationToJob(publication);
    
  });
      
}

let getJobList = function(parameters) {
  
  return co(function* () {  
    
    let publications = yield getPublicationList(parameters);
    
    let progress = new ProgressBar('  Parsing remote jobs [:bar] :total/:current :percent', { 
      incomplete: ' ',
      width: 80,
      total: publications.length 
    });
    
    let todo = [];
    
    //return publications;
    
    for (let publication of publications) {
      todo.push(publicationToJob(publication, progress));
    }

    return yield todo;
  });
  
}

let getFunctionGroups = function() {
  return co(function* () {
    
    let functions = yield getDataNodeList({
      type: 'Function0'
    });
    
    functions = functions.filter(filterHiddenFunctions);
    functions = functions.map(parseRawFunction);
    
    return functions;
    
  });
}

let getFunctions = function(parentId) {
  return co(function* () {

    let functions = yield getDataNodeList({
      type: 'Function1',
      parent: parentId
    });
    
    functions = functions.filter(filterHiddenFunctions);
    functions = functions.map(parseRawFunction);
    
    return functions;

  });
}

let getJobIdsByFilter = function(filters) {

  return co(function* () {  

    let qualifierList = [];
    
    // just the current jobs
    //(publicationEnd = nil or publicationEnd > (NSCalendarDate)'2015-09-17 00:00:00 +0100')
    
    let date = moment().format('YYYY-MM-DD HH:mm:ss +0200');
    
    qualifierList.push(format("(publicationEnd = nil OR publicationEnd > (NSCalendarDate)'%s')", date));
    qualifierList.push(format("(deadlineMaterial = nil OR deadlineMaterial > (NSCalendarDate)'%s')", date));
    qualifierList.push("toMedium.code = 'web'");
    
    //qualifierList.push('(toStatusNode.dataNodeID = 8608 OR toStatusNode.dataNodeID = 8605 OR toStatusNode.dataNodeID = 8610)');
    //8605
    
    for (let filterName in filters) {
      let filterValue = filters[filterName];

      switch (filterName) {
        case 'language':
          var localFilters = [];
          
          if (!Array.isArray(filterValue)) {
            filterValue = [filterValue];
          }
          
          for (let localFilterValue of filterValue) {
            localFilters.push(format('toVacancy.groupNodes.dataNodeID = %d', localFilterValue));
          }

          qualifierList.push(localFilters.join(' OR '));
          break;
        case 'professionalAreas':
          var localFilters = [];

          if (!Array.isArray(filterValue)) {
            filterValue = [filterValue];
          }

          for (let localFilterValue of filterValue) {
            localFilters.push(format('toVacancy.toFunctionLevel1.dataNodeID = %d', localFilterValue));
          }

          qualifierList.push(localFilters.join(' OR '));
          break;
        case 'experience':
          //qualifierList.push(format('groupNodes.dataNodeID IN (%s)', filterValue.join(',')));
          break;
        case 'search':
          qualifierList.push(format("toVacancy.jobTitle caseInsensitiveLike '*%s*'", filterValue));
          break;
      }
    }
    
    let query = {
      qualifier: qualifierList.join(' AND '),
      show: 'id',
      count: 1000
    }

    var res = (yield getPublicationList(query));
    
    return _.pluck(res, 'id');
  });

}

// get functiongroups
router.get('/api/functiongroups', function(req, res, next) {

  co(function* () {

    let functions = yield getFunctionGroups();
    res.json(functions).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });

});

// get functions by parentid
router.get('/api/functions/:parentid', function(req, res, next) {
  
  co(function* () {
    
    let parentId = req.params.parentid;

    let functions = yield getFunctions(parentId);
    res.json(functions).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });
  
});

// get languages
router.get('/api/languages', function(req, res, next) {

  co(function* () {

    let parentId = req.params.parentid;

    let functions = yield getFunctions(parentId);
    res.json(functions).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });

});

// get a job by id
router.get(/\/api\/jobs\/([0-9]+)$/, function(req, res, next) {
  
  co(function* () {
    
    let id = req.params[0];
    let job = yield getJob(id);
    
    res.json(job).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });
  
});

let addJob = function(job, progress) {
  var jobModel = new Model();

  jobModel = _.extend(jobModel, job);
  jobModel.synced = new Date();

  return q.ninvoke(jobModel, 'save')
    .then(function() {
      progress && progress.tick();
      return true;
    });
}

let updateJob = function(job, progress) {
  
  var updateData = _.extend(job, {
    synced: new Date()
  });
  
  return q.ninvoke(Model, 'update', { id: job.id }, updateData)    
    .then(function() {
      progress && progress.tick();
      return true;
    });
}

// get by ids
router.get('/api/jobs/byids/:ids', function(req, res, next) {

  co(function* () {

    var ids = JSON.parse(req.params.ids); 

    var items = yield Model.filterByPublicationIds(ids);

    res.json(items);

  }).catch(function(error) {
    
    res.status(500).send(response.error(error));
  });

});

router.get('/api/jobs/sync', function(req, res, next) {

  co(function* () {

    console.log('Sync start...');
    
    var filters = {
      //company: process.env.CX_COMPANY_ID
    }
    
    let jobs = yield getJobList(filters);
    
    let progress = new ProgressBar('  Saving jobs to database [:bar] :total/:current :percent', { 
      incomplete: ' ',
      width: 80,
      total: jobs.length 
    });
    
    let todo = [];
    
    let i = 0;
    
    for (let job of jobs) {
      
      todo.push((function(_job) {

        return co(function* () {
          
          let jobExists = yield Model.count({
            id: parseInt(_job.id)
          });
                    
          // updateJob(_job)
          
          return jobExists ? updateJob(_job, progress) : addJob(_job, progress);

        }).catch(function(error) {
          throw new Error(error.stack + ' ' + JSON.stringify(_job));
        });

      })(job));
    
    }
    
    yield todo;
    
    console.log('Sync finished.');

    res.json({}).end();    

  }).catch(function(error) {
    res.status(500).send(error.stack);
  });

});
  
// multi job filter
router.get(/\/api\/jobs\/([a-z]+\/[\[\],a-z0-9/]+)/i, function(req, res, next) {
  
  co(function* () {
    
    //qualifier=titleInformation%20like%20'*project*'
    
    let filters = parseAPICall(req);
    
    let jobs = yield getJobIdsByFilter(filters);
    
    res.json(jobs).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });
    
});

// all job filter
router.get(/\/api\/jobs/i, function(req, res, next) {
  
  co(function* () {
    
    let jobs = yield getJobIdsByFilter();
    
    res.json(jobs).end();

  }).catch(function(error) {
    res.status(500).send(error.message);
  });
    
});

// search text
router.get(/\/api\/jobslocal\/filter\/(.+)/i, function(req, res, next) {
  
  co(function* () {

    let filters = parseAPICall(req);

    var jobs = yield Model.filter(filters);
    
    res.json(jobs);
    
  }).catch(function(error) {
    res.status(500).send(error.message);
  });
  
});

// search text count
router.get('/api/contents/filtercount/:query/:tags', function(req, res, next) {
  
  var query = req.params.query; 
  var tags = JSON.parse(req.params.tags); 
  
  co(function* () {
    
    var items = yield Model.filter(query, tags).count();
    
    res.json(items);
    
  }).catch(function(error) {
    res.send(error.message).end();
  });
  
});

// filter by tag
router.get('/api/contents/bytag/:tags', function(req, res, next) {
  
  var query = req.params.query; 
  var tags = JSON.parse(req.params.tags);   
  
  co(function* () {
    
    var items = yield Model.filterByTag(tags);
    
    res.json(items);
    
  }).catch(function(error) {
    res.status(500).send(response.error(error));
  });
  
});

// get one
router.get('/api/contents/:id', function(req, res, next) {
  
  var id = req.params.id;
  
  co(function* () {

    var item = yield q.ninvoke(Model, 'findOne', { _id: id });

    if (!item) {
      throw new Error('Cannot find the item!');
    }

    res.json(item);
    
  }).catch(function(error) {
    res.status(500).send(response.error(error));
  });
  
});
//, isAuthenticatedMiddleware

// create
router.post('/api/contents', function(req, res, next) {
  co(function* () {
    
    var item = new Model();
    
    item = _.extend(item, req.body);
    item.created = new Date();
    item.modified = new Date();
    
    yield q.ninvoke(item, 'save');
    
    res.status(201).json(item);
    
  }).catch(function(error) {
    res.status(500).send(error);
  });
});

// modify
router.put('/api/contents/:id', function(req, res, next) {
  
  var id = req.params.id;
  
  co(function* () {
    
    //console.log(req.body.tags);
    
    var updateData = _.extend(req.body, {
      modified: new Date(),
      $addToSet: { tags: req.body.type }
    });
    
    delete updateData._id;
    delete updateData.__v;
    delete updateData.tags;
    
    yield q.ninvoke(Model, 'update', { _id: id }, updateData);
    
    res.status(204).end();
    
  }).catch(function(error) {
    res.status(500).send(response.error(error.message));
  });  
  
});

// delete
router.delete('/api/contents/:id', function(req, res, next) {

  var id = req.params.id;
  
  co(function* () {

    yield q.ninvoke(Model, 'remove', { _id: id });
    
    res.status(204).end();

  }).catch(function(error) {
    res.status(500).send(error);
  });  
  
  
});

////////////////////
// Gallery images //
////////////////////

// get images of an item
router.get('/api/contents/:id/galleries', function(req, res, next) {
  
  var id = req.params.id;
  
  co(function* () {

    var item = yield q.ninvoke(Model, 'findOne', { _id: id });

    if (!item) {
      throw new Error('Cannot find the item!');
    }

    res.json(item.gallery);
    
  }).catch(function(error) {
    res.status(500).send(response.error(error));
  });
  
});

// upload image to an item
router.post('/api/contents/:id/galleries', function(req, res, next) {
  
  UploadImage(req, res, next, {
    baseDir: process.env.UPLOAD_CONTENT_GALLERIES,
    Model: Model,
    imagesHash: 'gallery' 
  });
  
});

// reorder images of an item
router.put('/api/contents/:id/galleries', function(req, res, next) {
  
  var id = req.params.id;
  var images = JSON.parse(req.body.images);
  
  co(function* () {
    
    var updateData = {
      modified: new Date(),
      gallery: images
    };
    
    delete updateData._id;
    delete updateData.__v;
    delete updateData.tags;
    
    yield q.ninvoke(Model, 'update', { _id: id }, updateData);
    
    res.status(204).end();
    
  }).catch(function(error) {
    res.status(500).send(response.error(error.message));
  });  
  
});

// delete image from an item
router.delete('/api/contents/:id/galleries/:image', function(req, res, next) {
  
  var deleteImage = new DeleteImage(req, res, next, {
    baseDir: process.env.UPLOAD_CONTENT_GALLERIES,
    Model: Model,
    imagesHash: 'gallery' 
  });

});

///////////////////
// Inline images //
///////////////////

// upload image to an item
router.post('/api/contents/:id/images', function(req, res, next) {
  
  var uploadImage = new UploadImage(req, res, next, {
    baseDir: process.env.UPLOAD_CONTENT_IMAGES,
    Model: Model,
    imagesHash: 'images' 
  });
  
  uploadImage.on('end', function(result, req, res) {
    
    try {

      result.files.length && result.files[0].url && (fileURL = result.files[0].url);

      var link = url.parse(fileURL, false, true).pathname;

      res.json({
        link: link
      });

    } catch(error) {
      res.status(500).send(error);
    }
        
  });  
  
});

// delete image from an item
router.delete('/api/contents/:id/images/:image', function(req, res, next) {
  
  var deleteImage = new DeleteImage(req, res, next, {
    baseDir: process.env.UPLOAD_CONTENT_IMAGES,
    Model: Model,
    imagesHash: 'images' 
  });

});

module.exports = router;