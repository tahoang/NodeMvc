/*
Author: Tu Hoang
ESRGC 2014
OKDashboard

DataRepository.js

Data repository for OKDashboard
Data provider for controllers
*/
var fs = require('fs');
var Class = require('../class');
var SqlRepository = require('./sqlRepository');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var appPath = require('app-root-path');
var dbConfig = require(appPath + '/appSettings').dbConfig;

var DataRepository = Class.define({
  extend: SqlRepository,
  name: 'DataRepository',
  defaultQueryPath: './data/queries',
  initialize: function(options) {
    SqlRepository.prototype.initialize.apply(this, arguments);
    //console.log('Loading database config..');
    //if config is still undefined then read config file
    if (typeof this.config == 'undefined') {
      //  var configFile = './appConfig.json';
      //  console.log('config file path: ' + configFile);
      //  var c = fs.readFileSync(configFile.toString(), 'utf8');
      //  console.log(c);
      //  this.config = JSON.parse(c).dbConfig;
      this.config = dbConfig;
      //console.log(this.config);
    }

    //set request time out
    this.config.options.requestTimeout = 30 * 1000;
    //constructor initialize function
    console.log('--DataRepository initialized.')
  },
  //sql server config can either be passed in to the constructor or specified here.
  //config that is specified here will be ignored if it's passed 
  //in to the constructor when creating an instance of this class.
  //config: {
  //  "server": "esrgc1",
  //  "userName": "gisApp",
  //  "password": "ESRGCGISAdmin1",
  //  "options": {
  //    database: "OKDashboard",
  //    port: 37742
  //  }
  //},
  onSqlExecuted: function(err, rowCount, rows) {
    //console.log(rows);
    //data is in dataRows
    if (rows.length > 0) {
      this.data = rowsToObjectLiteral(rows);
      this.dataDictionary = rowsToObject(rows);
    }
    else {
      this.data = [];
      this.dataDictionary = [];
    }
  },
  onRowEvent: function(columns) {
    //do something on each row
  }
});


//private functions
/*
* {name: colName, value: value}
*/
function rowsToObject(rows) {
  var result = []
  rows.forEach(function(row) {
    row.forEach(function(column) {
      var value = column.value
      if (typeof value === 'number') {
        value = value + ''
      }
      if (typeof value === 'string') {
        value = value.trim()
      }
      //value = value.trim()
      var obj = {
        label: column.metadata.colName,
        value: value
      }
      result.push(obj)
    })
  })
  return result
}

/*
* {colName: value}
*/
function rowsToObjectLiteral(rows) {
  var result = []
  rows.forEach(function(row) {
    var newrow = {}
    row.forEach(function(column) {
      var value = column.value
      if (typeof value === 'number') {
        value = value + ''
      }
      if (typeof value === 'string') {
        value = value.trim()
      }
      newrow[column.metadata.colName] = value
    })
    result.push(newrow)
  })
  return result
}


module.exports = DataRepository;