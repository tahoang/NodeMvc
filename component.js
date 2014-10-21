/*
Author: Tu Hoang
ESRGC 2014


Component.js

Component class for all the classes to derive from. 
This class provides Component properties, and copy options in constructor

*/

var Class = require('./class');
var EventEmitter = require('events').EventEmitter;

var Component = Class.define({
    name: 'Component',
    extend: EventEmitter,
    initialize: function(options) {
        //constructor initialize function
        //copy all the option to the object
        //console.log('Component');
        Class.copy(this, options);
    }
    

});

module.exports = Component;