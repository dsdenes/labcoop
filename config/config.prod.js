var path = require('path');

console.log('Production environment loaded.');

process.env.GLOBIFY_FILES = ['**/snippets.js'];

process.env.DB_HOST = '52.28.182.24';
process.env.DB_PORT = 27122;
process.env.DB_USER = null;
process.env.DB_PASS = null;
process.env.DB_DATABASE = 'labcoop';

process.env.EXPRESS_SECRET = 'waVU07ZUUlXWqMdXSi7XtAxmoCMeZlxSnitakHn349mnlC0cKls0rFbpQcQMO2Nh';

process.env.MANDRILL_KEY = '4uKbK8LRNPOafHsJhcPS9Q';

process.env.GOOGLE_CLIENT_ID = "514811219065-rs8oinmbqb1j3gf0133l0g3fgm2u0h9d.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "11Wbb3RHQ0gx-v7kduCPMvrG";