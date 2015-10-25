var Module = {  
  router: function() {
    return require('./router.js');
  },
  
  controller: function() {
    return require('./controller.js');
  },
  
  layout: function() {
    return require('./layout.js');
  },
  
  init: function() {
    var _this = this;
    
    return this;
  }
};

module.exports = Module;