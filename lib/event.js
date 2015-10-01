var q = require('q');
var App = require('../app');
var debug = App.debugFactory('app:layout');
var $ = require('jquery');

module.exports = {
  eventController: function(advertiseEvent, answerEvent, answerHandler) {
    
    debug('eventController:' + advertiseEvent);
    
    var d = q.defer();
    
    var eventHandler = function *(params) {
      d.resolve(yield answerHandler(params));
      target.removeEventListener(answerEvent, eventHandler);
    }
    
    console.log(target);
    console.log($(target).data('events'));

    /*
    if (!target.listeners()) {
      d.resolve(true);
    } else {
      target.on(answerEvent, eventHandler);
      target.trigger(advertiseEvent);
    }*/
    
    return d.promise;

  }
}