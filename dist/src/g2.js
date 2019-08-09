"use strict";
exports.__esModule = true;
var f_1 = require("./f");
var f2_1 = require("./f2");
var group_1 = require("./group");
var defs_1 = require("./defs");
var G2 = /** @class */ (function () {
    function G2() {
    }
    G2.b = function () {
        return f2_1["default"].fromElements(f_1["default"].fromBig(defs_1.Defs.bTwist[0]), f_1["default"].fromBig(defs_1.Defs.bTwist[1]));
    };
    G2.fromElements = function (x, y) {
        var elem = new G2();
        elem.g = group_1["default"].fromElements(G2.b(), f2_1["default"].zero(), f2_1["default"].one(), x, y, f2_1["default"].one());
        return elem;
    };
    G2.prototype.add = function (p2) {
        var elem = this.g._add(G2.b(), f2_1["default"].zero(), f2_1["default"].one(), p2.g);
        var p = new G2();
        p.g = elem;
        return p;
    };
    G2.prototype.dbl = function () {
        var elem = this.g._double(G2.b(), f2_1["default"].zero(), f2_1["default"].one());
        var p = new G2();
        p.g = elem;
        return p;
    };
    G2.prototype.scalarMult = function (s) {
        var infinity = group_1["default"].fromElements(G2.b(), f2_1["default"].zero(), f2_1["default"].one(), f2_1["default"].zero(), f2_1["default"].one(), f2_1["default"].zero());
        var elem = this.g._scalarMult(G2.b(), infinity, f2_1["default"].zero(), f2_1["default"].one(), s);
        var p = new G2();
        p.g = elem;
        return p;
    };
    G2.prototype.negate = function () {
        var affineThis = this.toAffine();
        return G2.fromElements(affineThis.x(), affineThis.y().negate());
    };
    G2.prototype.equals = function (p2) {
        return this.g.equals(p2.g);
    };
    G2.prototype.toAffine = function () {
        var p = new G2();
        p.g = this.g.toAffine();
        return p;
    };
    G2.prototype.x = function () {
        return this.g.x();
    };
    G2.prototype.y = function () {
        return this.g.y();
    };
    G2.prototype.z = function () {
        return this.g.z();
    };
    G2.prototype.toString = function (base) {
        return this.g.toString(base);
    };
    return G2;
}());
exports["default"] = G2;
