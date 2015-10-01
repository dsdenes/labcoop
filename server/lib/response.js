var format = require('util').format;

module.exports = {  
  error: function(message, code) {
    
    var error = {
      error: message,
      status: code
    };
    
    //var match;
    
    /*
    while ((match = /Path `([^`]+)` is required/.exec(message)) !== null) {
      console.log(match);
    }*/
    
    //if (match) error.fields = match[1];
    
    return error; 
    
  },
  
  result: function(result) {
    return {
      result: result,
      status: 200
    }
  }
}