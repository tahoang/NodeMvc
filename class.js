/*
Tu Hoang
2014

class.js
utility functions that implements OOP
*/

/*
function that defines a new class by passing a new
prototype object (literal) as parameter. New classes
can extend/inherit from other classes by passing the 
inherit class name to extend property of the new class 
prototype object

Example: 
var class = require('lib/class');
var newClass = class.define({
    extend: OtherClass,
    initialize: function(options){
    };
});
*/


var define = function(child) {
    var ch = child;
    var p = ch.extend;
    var _class_ = null;
    if (p == null || typeof p == 'undefined') {
        _class_ = function(options) {
            if (typeof this.initialize != 'undefined')
                this.initialize.apply(this, arguments);
        };
        _class_.prototype = ch;
    }
    else {
        _class_ = function(options) {
            var init = typeof this.initialize == 'function' ? this.initialize : 'undefined';
            //run child initialize function if exists
            if (typeof init == 'function') {
                init.apply(this, arguments);
            }
        };
        extend(_class_, p); //inherit prototype
        copy(_class_.prototype, ch); //augment prototype
    }
    return _class_;
};

exports.define = define;
/*
Deep copy object prototype by new keyword.
This method creates a new prototype object, whose prototype 
is a copy of the parent's prototype, and assign it to the child prototype.
Finally, sets the child's prototype constructor to the child's constructor
*/
var extend = function(child, parent) {
    var F = function() { };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.parent = parent.prototype;
};
//copy object properties
var copy = function(dest, source) {
    dest = dest || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                dest[property] = value;
            }
        }
    }
};

exports.copy = copy;