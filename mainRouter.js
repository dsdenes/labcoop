import App from 'app';

const router = new (App.Backbone.Router.extend({   

  routes: {
    '': 'default'
  }
  
}));

export default router;

router.on('route:default', function(params) {
  App.layout.render();
});
