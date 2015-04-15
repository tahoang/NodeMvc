/*
Author: Tu Hoang
ESRGC 2014

Base controller class 

provides base functionalities for route handling

*/
var express = require('express');
//var router = express.Router();

var Class = require('../class');
var Component = require('../component');
var DataRepository = require('../data/dataRepository');

var baseController = Class.define({
  _className: 'BaseController',
  extend: Component,
  mountPath: '',
  name: '',//specified in sub controllers

  autoMapRoutes: true, //default behavior
  //initialize function runs in constructor
  initialize: function(options) {
    Component.prototype.initialize.apply(this, arguments);
    //get router for this controller
    this.router = express.Router();

    //merging custom routes
    //copy custom get/post/put/delete objects (append if exists)
    if (typeof this.getMethods != 'undefined') {
      var get = this.getMethods;
      for (var i in get) {
        var m = get[i];
        if (typeof m == 'object') {
          this.get[i] = m;
        }
      }
    }
    //copy post methods
    if (typeof this.postMethods != 'undefined') {
      var post = this.postMethods;
      for (var i in post) {
        var m = post[i];
        if (typeof m == 'object') {
          this.post[i] = m;
        }
      }
    }

    //copy put methods
    if (typeof this.putMethods != 'undefined') {
      var put = this.putMethods;
      for (var i in put) {
        var m = put[i];
        if (typeof m == 'object') {
          this.put[i] = m;
        }
      }
    }
    //copy delete methods
    if (typeof this.delMethods != 'undefined') {
      var del = this.delMethods;
      for (var i in del) {
        var m = del[i];
        if (typeof m == 'object') {
          this.del[i] = m;
        }
      }
    }
    //map routes
    if (this.autoMapRoutes == true)
      ///this is optional!! calling this will map your routes automatically
      //additional action methods are required in subcontrollers
      this.mapRoutes();

    console.log(this.name + ' controller initialized.');
  },
  //return data repo for all controllers
  getRepo: function() {
    return new DataRepository();
  },
  //get route path for current controller
  getRoutePath: function() {
    if (this.mountPath == '')
      return '/' + this.name;
    else
      return '/' + this.mountPath + '/' + this.name;
  },  
  //action methods go here defined in sub-controllers
  get: {},
  post: {},
  put:{},
  del: {},
  mapRoutes: function() {
    var router = this.router;
    //add middlewares (controller level)
    for (var i in this.middlewares) {
      var mw = this.middlewares[i];
      parseMiddleware(mw, this);
    }

    //get methods
    for (var i in this.get) {
      var route = this.get[i];
      parseRoute(i, route, 'get', this);

    }
    //post methods
    for (var i in this.post) {
      var route = this.post[i];
      parseRoute(i, route, 'post', this);
    }
    //put methods
    for (var i in this.put) {
      var route = this.put[i];
      parseRoute(i, route, 'put', this);
    }
    //delete methods
    for (var i in this.delete) {
      var route = this.delete[i];
      parseRoute(i, route, 'delete', this);
    }

    //add params handlers (controller level)
    for (var i in this.params) {
      var param = this.params[i];
      if (typeof param.name != 'undefined' && typeof param.callback == 'function')
        router.param(param.name, param.callback);
    }    
  }
});

module.exports = baseController;

//private functions
var parseRoute = function(actionName, route, httpVerb, controller) {
  if (typeof route == 'undefined') {
    console.log('route is undefined');
    return;

  }
  var router = controller.router;
  if (httpVerb == '') {
    console.log(route + ' has no httpVerb specified. HTTP verb is required');
    return;
  }

  //construct current route path for this route 
  //concat with action method's actionName if
  //custom path doesn't exist
  var routePath = '';
  var rootPath = controller.getRoutePath();//controller root path
  if (typeof route.path == 'undefined')
    routePath = '/' + actionName;
  else
    routePath = route.path;//path must contain "/" to begin with

  //process route middlewares
  if (typeof route.middlewares != 'undefined') {
    for (var i in route.middlewares) {
      var mw = route.middlewares[i];
      if (typeof mw != 'undefined') {
        mw.path = routePath;
        parseMiddleware(mw, controller);//add middlewares
      }
    }
  }

  //generate url path
  var params = route.params;
  var paramsToAdd = [];
  if (typeof params != 'undefined') {
    if (params instanceof Array) {
      for (var i in params) {
        var param = params[i];
        //only modify path when custom path isn't available
        if (typeof route.path == 'undefined')
          routePath += '/:' + param.name;
        //router.param(param.name, param.callback);
        if (typeof param.callback == 'function')
          paramsToAdd.push({ name: param.name, callback: param.callback });
      }
    }
    else {
      //only modify path when custom path isn't available
      if (typeof route.path == 'undefined')
        routePath += '/:' + params.name;
      if (typeof params.callback == 'function')
        paramsToAdd.push({ name: params.name, callback: params.callback });
      //router.param(params.name, params.callback);
    }
  }

  //then add params
  for (var i in paramsToAdd) {
    var p = paramsToAdd[i];
    router.param(p.name, p.callback);
  }

  //finally action method is invoked
  if (typeof route.handler === 'function') {
    //use closure to call the right call back
    //(edited: not necessary because route is passed to this
    //function so it's already local to this function)
    //var handler = (function(callback) {
    //    return function(req, res, next) {
    //        callback.apply(this, arguments);
    //    };
    //})(route.handler);
    var handler = route.handler;

    switch (httpVerb) {
      case 'get':
        router.get(rootPath + routePath, handler);
        break;
      case 'post':
        router.post(rootPath + routePath, handler);
        break;
      case 'put':
        router.put(rootPath + routePath, handler);
        break;
      case 'delete':
        router.delete(rootPath + routePath, handler);
        break;
    }
  }
  //console.log(router);
};


var parseMiddleware = function(mw, controller) {
  if (typeof mw == 'undefined' || typeof controller == 'undefined')
    return;
  var router = controller.router;
  if (typeof router == 'undefined')
    return;
  var rootPath = controller.getRoutePath();
  if (mw.path != '' && typeof mw.path != 'undefined') {
    router.use(rootPath + mw.path, mw.callback);
  }
  else {
    router.use(rootPath, mw.callback);
  }

}