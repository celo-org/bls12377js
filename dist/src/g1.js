"use strict";
exports.__esModule = true;
var f_1 = require("./f");
var group_1 = require("./group");
var defs_1 = require("./defs");
var G1 = /** @class */ (function () {
    function G1() {
    }
    G1.b = function () {
        return f_1["default"].fromBig(defs_1.Defs.b);
    };
    G1.fromElements = function (x, y) {
        var elem = new G1();
        elem.g = group_1["default"].fromElements(G1.b(), f_1["default"].zero(), f_1["default"].one(), x, y, f_1["default"].one());
        return elem;
    };
    G1.prototype.add = function (p2) {
        var elem = this.g._add(G1.b(), f_1["default"].zero(), f_1["default"].one(), p2.g);
        var p = new G1();
        p.g = elem;
        return p;
    };
    G1.prototype.dbl = function () {
        var elem = this.g._double(G1.b(), f_1["default"].zero(), f_1["default"].one());
        var p = new G1();
        p.g = elem;
        return p;
    };
    G1.prototype.scalarMult = function (s) {
        var infinity = group_1["default"].fromElements(G1.b(), f_1["default"].zero(), f_1["default"].one(), f_1["default"].zero(), f_1["default"].one(), f_1["default"].zero());
        var elem = this.g._scalarMult(G1.b(), infinity, f_1["default"].zero(), f_1["default"].one(), s);
        var p = new G1();
        p.g = elem;
        return p;
    };
    G1.prototype.equals = function (p2) {
        return this.g.equals(p2.g);
    };
    G1.prototype.negate = function () {
        var affineThis = this.toAffine();
        return G1.fromElements(affineThis.x(), affineThis.y().negate());
    };
    G1.prototype.toAffine = function () {
        var p = new G1();
        p.g = this.g.toAffine();
        return p;
    };
    G1.prototype.x = function () {
        return this.g.x();
    };
    G1.prototype.y = function () {
        return this.g.y();
    };
    G1.prototype.z = function () {
        return this.g.z();
    };
    G1.prototype.toString = function (base) {
        return this.g.toString(base);
    };
    return G1;
}());
exports["default"] = G1;
