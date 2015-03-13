var fs = require('fs');
var path = require('path');
var appPath = require('app-root-path');
var controllerDir = appPath + '/controllers';


var registerRoutes = function(app, defaultRoute, mountPath) {
  if (typeof app == 'undefined') {
    console.log('Express app instance is required to map routes.');
    return;
  }

  //set default route
  if (typeof defaultRoute != 'undefined') {
    app.get('/', function(req, res) {
      res.redirect(defaultRoute);
    });
  }


  var controllerNames = fs.readdirSync(controllerDir);
  for (var i in controllerNames) {
    var Controller = require(controllerDir + '/' + controllerNames[i]);
    if (typeof Controller == 'function') {
      try {
        var controller = new Controller();
        var path = '';
        if (typeof mountPath == 'undefined')
          path = '/';
        else
          path = mountPath;


        //console.log(controller);
        app.use(path, controller.router);//map routes to application

        //set default routes
        app.get('/' + controller.name, (function(name) {
          return function(req, res) {
            res.redirect(name + '/index');
          }
        })(controller.name));

        //finally set app reference to controller
        controller.app = app;
      }
      catch (e) {
        console.log('Could not load controller ' + controllerNames[i]);
        console.log(e);
      }
    }

  }
};

exports.registerRoutes = registerRoutes;