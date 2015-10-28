export default {
  Router: () => {
    import Router from './router.js';
    return Router;  
  },
  
  Controller: () => {
    import Controller from './controller.js';
    return Controller;  
  },
  
  Layout: () => {
    import Layout from './layout.js';
    return Layout;  
  },
}
