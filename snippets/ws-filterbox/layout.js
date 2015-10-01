var path = require('path');
var App = require('app');
var fs = require('fs');
var format = require('util').format;
var Handlebars = require('handlebars');
var debug = App.debugFactory('snippet:filterbox:layout');
var co = require('co');

var layoutTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

var $ = require('jquery');

App.eventReqres.setHandler("render:filterbox" , function(options){
  return LayoutView;
});

var LayoutView = App.LayoutView.extend({   
  
  id: 'ws-filterbox',
  
  filters: {},
  jobIds: [],
  
  className: 'row',
  
  initialize: function(options) {
    this.options = options;
  },
  
  render: function() {
    
    this.options.lang1 = ['German', 'Italian', 'French', 'Spanish'];
    this.options.lang2 = ['Dutch', 'Russian', 'Portuguese', 'Polish', 'Swedish'];
    this.options.lang3 = ['Czech', 'Greek', 'Turkish', 'Slovak', 'Hebrew'];
    this.options.lang4 = ['Chinese', 'Slavic', 'Slovenian', 'Romanian', 'Ukrainian'];
    
    this.$el.html(this.template(this.options));
  },
  
  template: Handlebars.compile(layoutTemplate),
  
  events: {
    'click .filtermenu': 'showFiltertab',
    'click .filtertab input': 'setFilter',
    'click #go': 'showJobs',
    'click #clear': 'clearFilters',
    'keyup #querytext': 'textSearch'
  },
  
  onRender: function() {
    debug('render');
    this.renderNested();
  },
  
  showJobs: function() {
    if (!this.filtered) {
      
      var _this = this;
      
      co(function* () {

        _this.jobIds = yield _this.getJobIds();
        //console.log(_this.jobIds);
        App.commands.execute('showJobs', _this.jobIds); 

      });
      
    } else {
      App.commands.execute('showJobs', this.jobIds);
    }
  },
  
  setFilter: function(event) {
    
    this.filtered = true;
    
    $('#go').prop('disabled', true);
    
    var $target = $(event.target);
    
    var $parent = $target.parents('.filtertab');
    var filterOn = $parent.data('filter');
    var value = $target.val();
    
    $('#go > span.text').html('list positions: <i class="fa fa-cog fa-spin"></i><span class="count"></span>');

    var transObj = {
      'professionalAreas': {
        'IT Services':                        9644,
        'IT Service Desk':                    9541,
        'Finance & Accounting':               9536,
        'Market Analisys':                    9540,
        'Life Sciene':                        9697,
        'Special Programs & Internships':     null,
        'HR Outsourcing Services':            null,
        'Corporate Functions':                9545
      },
      'language': {
        'English':    9620,
        'German':     9621,
        'Italian':    9522,
        'French':     9623,
        'Spanish':    9624,
        'Dutch':      9625,
        'Russian':    9526,
        'Portuguese': 9627,
        'Polish':     9628,
        'Swedish':    9629,
        'Czech':      9630,
        'Greek':      9631,
        'Turkish':    9632,
        'Slovak':     9633,
        'Hebrew':     9634,
        'Chinese':    9635,
        'Slavic':     9536,
        'Slovenian':  9537,
        'Romanian':   9638,
        'Ukrainian':  9539
      }
    }
    
    value = transObj[filterOn][value];
    
    if ($target.is(':checked')) {
      this.addFilter(filterOn, value);
    } else {
      this.removeFilter(filterOn, value);
    }
    
    if (!Object.keys(this.filters).length) {
      $('#go > span.text').html('see all positions');
    }
      
    var _this = this;

    co(function* () {

      _this.jobIds = yield _this.getJobIds();
      var jobCount = _this.jobIds.length;  

      $('#go').prop('disabled', false);
      $('#go i.fa-cog').hide();
      $('#go .count').text(jobCount);
    });
  
  },
  
  textSearch: function() {
    var query = $('#querytext').val().replace(/"/g, "");
    
    if (!query) {
      this.removeFilter('search');
      return true;
    };
    
    this.addFilter('search', query);
    
    var _this = this;
    
    co(function* () {

      $('#go > span.text').html('list positions: <i class="fa fa-cog fa-spin"></i><span class="count"></span>');

      _this.jobIds = yield _this.getJobIds();
      var jobCount = _this.jobIds.length;  

      $('#go').prop('disabled', false);
      $('#go i.fa-cog').hide();
      $('#go .count').text(jobCount);
      
    });    
  
  },
  
  clearFilters: function() {
    this.$el.find('.filtertab input:checked').each(function() {
      this.click();
    });
  },
  
  getJobIds: function() {
    var url = this.getFilterUrl();    
    return (url !== false) ? $.getJSON(this.getFilterUrl()) : [];
  },
  
  addFilter: function(filterOn, value) {
    if (!value) return;
    
    if (filterOn === 'search') {
      this.filters[filterOn] = value;
      return;
    }
    
    this.filters[filterOn] || (this.filters[filterOn] = []);
    this.filters[filterOn].push(value);
  },
  
  removeFilter: function(filterOn, value) {
    if (typeof this.filters[filterOn] === 'undefined') {
      return true;
    }
    
    if (filterOn === 'search') {
      delete this.filters[filterOn];
      return;
    }
    
    var index = this.filters[filterOn].indexOf(value);
    if (index > -1) {
      this.filters[filterOn].splice(index, 1);
    }
    
    if (this.filters[filterOn].length === 0) {
      delete this.filters[filterOn];
    }
  },
  
  getFilterUrl: function() {
    
    var filters = [];
    
    for (var filterOn in this.filters) {
      if (this.filters[filterOn].length) {
        filters.push(filterOn + '/' + (Array.isArray(this.filters[filterOn]) ? JSON.stringify(this.filters[filterOn]) : this.filters[filterOn]));
      }
    }
    
    return filters.length ? format('/api/jobs/%s', filters.join('/')) : format('/api/jobs');
  },
  
  showFiltertab: function(event) {

    var $target = $(event.target).hasClass('filtermenu') ? $(event.target) : $(event.target).parents('.filtermenu');
    var index = $target.parent().find('.filtermenu').index($target);
    
    var $filtertab = this.$el.find('.filtertab').eq(index);

    $filtertab.siblings().hide();
    $filtertab.show();
  }
  
});

module.exports = LayoutView;
