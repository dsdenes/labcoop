var path = require('path');

console.log('Development environment loaded.');

process.env.GLOBIFY_FILES = ['app/lib/snippets.js'];

process.env.DB_HOST = '52.28.182.24';
process.env.DB_PORT = 27122;
process.env.DB_USER = 'mongo-labcoop';
process.env.DB_PASS = 'OHq4KT4tR7';
process.env.DB_DATABASE = 'labcoop';

process.env.EXPRESS_SECRET = 'waVU07ZUUlXWqMdXSi7XtAxmoCMeZlxSnitakHn349mnlC0cKls0rFbpQcQMO2Nh';

process.env.MANDRILL_KEY = '4uKbK8LRNPOafHsJhcPS9Q';

process.env.GOOGLE_CLIENT_ID = "402031923769-dgtclelgttjqou9mgf0v2prllf96frgu.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "398C8ULCZkKBq7cG3Vt40Ll3";