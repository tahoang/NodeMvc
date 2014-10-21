/*
Author: Tu Hoang
ESRGC 2014
OKDashboard

sqlRepository.js

SQL data repository
used to execute and retrieve data from SQL server

Dependency: Tedious package
*/

var Class = require('../class');
var Component = require('../component');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var SqlRepository = Class.define({
  name: 'SqlRepository',
  extend: Component,
  initialize: function(options) {
    Component.prototype.initialize.apply(this, arguments);
    //constructor initialize function
    //console.log('SqlRepository initialized.')
  },
  connection: null,
  dataRows: [],//contains raw data after a request is executed
  data: {},//data in object literal
  outputParams: {},
  /*
    Execute sql query statement.
    statement: query to be executed
    params: object of parameters required for the query
    callback: called when request is completed
  */
  executeQuery: function(sql, params, callback) {
    var scope = this;
    scope.connection = new Connection(this.config);
    //once connected
    scope.connection.on('connect', function(err) {
      //if error then return
      if (err) {
        console.log(this.name + ': "Error creating connection."');
        console.log(err);
      }
      else {
        //create request
        var request = scope.createRequest(sql, params, callback);
        console.log('Executing query "' + sql + '"...');
        //console.log(request);
        //execute the request
        scope.connection.execSql(request);
      }
    });
  },
  /*
    Execute stored procedure.
    name: name of the stored procedure to be executed
    params: parameters for the procedure
    callback: called when request is completed
  */
  executeProcedure: function(sql, params, callback) {
    var scope = this;
    scope.connection = new Connection(this.config);
    //once connected
    scope.connection.on('connect', function(err) {
      //if error then return
      if (err) {
        console.log(this.name + ': "Error creating connection."');
        console.log(err);
      }
      else {
        //create request
        var request = scope.createRequest(sql, params, callback);
        console.log('Executing procedure "' + sql + '"...');
        //console.log(request);
        //execute the request
        scope.connection.callProcedure(request);
      }
    });
  },
  /*
    Create request for execution.
    sql: statement to be executed or stored procedure's name
    params: object of parameters for this request.
    params object consists of all parameter types and values
  */
  createRequest: function(sql, params, callback) {
    var scope = this;//scope of this class
    scope.dataRows = [];//clear buffer
    scope.data = {};
    var request = new Request(sql, function(err, rowCount, rows) {
      //error occured when executing statement
      if (err) {
        console.log(err);
        //close connection when done
        scope.connection.close();
      }
      else {//no error 
        //var rows = rowCount || rows.length;
        console.log('Sql statement/name: "'+ sql+'" was executed successfully!');

        //run done callback if exists
        if (typeof scope.onSqlExecuted == 'function')
          scope.onSqlExecuted.call(scope, err, rowCount, scope.dataRows)
        //finally run the call back passed into this request
        if (typeof callback == 'function')
          callback.call(scope, scope.data, scope.dataDictionary, scope.outputParams);
      }
      //close connection when done
      scope.connection.close();
      console.log('--Connection to database closed!');
    });

    //on row event
    request.on('row', function(columns) {
      //process data for each row
      //data returned from this query
      scope.dataRows.push(columns);
      //call custom callback for row event
      if (typeof scope.onRowEvent == 'function') {
        scope.onRowEvent.apply(scope, arguments);
      }

    });

    request.on('returnValue', function(param, value, metaData) {
      console.log('Return value event');
      console.log('param "' + param + '": ' + value);
      scope.outputParams[param] = value;
    });

    //on request done event 
    //this can be ignored in regular requests, but in case it's needed.
    request.on('done', function(rowCount, more) {
      //call custom call back for done event
      if (typeof scope.onDoneEvent == 'function') {
        scope.onDoneEvent.apply(scope, arguments);
      }

    });

    //add parameters
    for (var i in params) {
      var param = params[i];
      if(typeof param.output == 'undefined')
        request.addParameter(param.name, param.type, param.value);
      else if(param.output)
        request.addOutputParameter(param.name, param.type);
    }

    return request;
  }
});

module.exports = SqlRepository;