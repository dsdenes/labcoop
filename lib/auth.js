import App from '../App';
import $ from 'jquery';
import q from 'q';
import co from 'co';

let loggedinUserId = null;
let loggedinUserIdRequest;
let getting = false;

function isLoggedin() {
  return co(function* () {
    
    return !!(yield getLoggedinUserId());
    
  }).catch(function(error) {
    return false;
  });
};

function getLoggedinUserId(force) {
  
  if (loggedinUserIdRequest) {
    return loggedinUserIdRequest;
  }
  
  if (!loggedinUserId || force) {
    
    loggedinUserIdRequest = co(function*() {
      
      loggedinUserId = (yield $.getJSON('/api/auth/user'))['_id'];  
      loggedinUserIdRequest = null;
      return loggedinUserId;
      
    }).catch(function(error) {
      loggedinUserId = null;
      loggedinUserIdRequest = null;
      throw error;
    });
    
    return loggedinUserIdRequest;
    
  } else {
    return q(loggedinUserId);
  }
  
};

function logout() {
  
  loggedinUserId = null;
  
  return co(function*() {
    
    yield $.get('/api/auth/logout');  
    App.vent.trigger('loggedin', false);
    return true;
    
  }).catch(function(error) {
    throw error;
  });
  
};

function login(username, password) {
  return co(function*() {
    
    yield $.post('/api/auth/login', { 
      username: username,
      password: password
    }, 'json');
    
    return afterLogin();
    
  });
};

function afterLogin() {
  return co(function*() {
    
    yield getLoggedinUserId(true);
    App.vent.trigger('loggedin', true);
    return;
    
  });
};

function loginByToken(username, token) {
  return co(function*() {
    
    yield $.post('/api/auth/login/token', { 
      username: username,
      token: token
    }, 'json');

    return afterLogin();
  });    
}

isLoggedin();

export {
  getLoggedinUserId,
  isLoggedin,
  logout,
  login,
  loginByToken,
};