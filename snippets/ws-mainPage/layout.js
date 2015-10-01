var path = require('path');
var App = require('app');
var fs = require('fs');

var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:mainPage:layout');

var format = require('util').format;

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var lazyYoutube = require('lazy-youtube');
var fancybox = require('fancybox');
var scroll = require('smooth-scroll');

// default content
App.eventReqres.setHandler("render:content" , function() {
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-mainpage',
  
  template: Handlebars.compile(layoutTemplate),

  regions: {  

    'filterbox': {
      selector: '.region-filterbox',
      allowMissingEl: true
    },
    
    'joblist': {
      selector: '.region-joblist',
      allowMissingEl: true
    }

  },   
  
  render: function() {
    debug('LayoutView render');
    this.$el.html(this.template(this.options));
  },  
  
  events: {
    'click .areas .area': function(event) {
      var $target = $(event.target).hasClass('area') ? $(event.target) : $(event.target).parents('.area');
      var area = $target.data('area');
      
      $('.areaboxes').slick('slickGoTo', area, false);
    },
    
    'click .areaboxes .area > .left': function() {
      $('.areaboxes').slick('slickPrev');
    },

    'click .areaboxes .area > .right': function() {
      $('.areaboxes').slick('slickNext');
    },
    
    'click .lazyYT svg': function(event) {
      
      var $parent = $(event.target).parents('.lazyYT');
      var videoID = $parent.data('youtube-id');
      
      var url = $(this).attr('href');
      
      $.fancybox({
        'autoSize': true,
        'wrapCSS': 'ytwrap',
        'href' : format('//www.youtube.com/embed/%s?autoplay=1', videoID),
        'type': 'iframe' // see this?
      });  

    },
    
    'click #about-tcs .cube': function(event) {
      var $target = $(event.target).hasClass('cube') ? $(event.target) : $(event.target).parents('.cube');
      App.router.navigate(format('content/%s', $target.data('content')), { trigger: true });  
      scroll.animateScroll(null, 'body');
    },
    
    'click .areaboxes .search button': function() {
      scroll.animateScroll(null, '#search-jobs');
    }
  },

  onShow: function() {
    debug('render'); 
    this.renderNested();
    
    var yt = function($element){
      
      var innerHtml = [
        '<div class="ytp-thumbnail">',
          '<div class="ytp-large-play-button">',
            '<svg>',
              '<path fill-rule="evenodd" clip-rule="evenodd" fill="#1F1F1F" class="ytp-large-play-button-svg" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>',
              '<polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>',
            '</svg>',
          '</div>',
        '</div>'
      ].join('');      
      
      var id = $element.data('youtube-id');
      
      var youtubeImageUrl = function () {
        return format("url('http://img.youtube.com/vi/%s/0.jpg')", id);
      };
      
      $element.html(innerHtml);
      
      $element.find('.ytp-thumbnail').css('background-image', youtubeImageUrl());
      
    };
    
    $('.carousel-video .lazyYT').each(function() {
      
      yt($(this));

    });
    
    $('.carousel-video').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      prevArrow: $('.videos .left'),
      nextArrow: $('.videos .right')
    });
    
    $('.areaboxes').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false
    }).on('afterChange', function(slick, slide) {
      
      var index = $(slide).siblings().index(slide);
      
      var $slide = $(slide.$slides[slide.currentSlide]);
      
      $(slide.$list[0]).height($slide.outerHeight() + 14);
    
    });
    
  },

  initialize: function() {
    debug('initialize');
  }
  
});

module.exports = LayoutView;
