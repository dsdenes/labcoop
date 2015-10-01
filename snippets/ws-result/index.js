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

  }
};

module.exports = Module;