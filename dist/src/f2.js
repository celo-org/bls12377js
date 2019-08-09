"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var bigInt = require("big-integer");
var defs_1 = require("./defs");
var f_1 = __importDefault(require("./f"));
var F2 = /** @class */ (function () {
    function F2() {
    }
    F2.fromElements = function (c0, c1) {
        var f = new F2();
        f.c0 = c0;
        f.c1 = c1;
        return f;
    };
    F2.prototype.equals = function (b) {
        return (this.c0.equals(b.c0) && this.c1.equals(b.c1));
    };
    F2.prototype.add = function (b) {
        var f = new F2();
        f.c0 = this.c0.add(b.c0);
        f.c1 = this.c1.add(b.c1);
        return f;
    };
    F2.prototype.subtract = function (b) {
        var f = new F2();
        f.c0 = this.c0.subtract(b.c0);
        f.c1 = this.c1.subtract(b.c1);
        return f;
    };
    F2.prototype.power = function (e) {
        var ecopy = bigInt(e);
        var bits = [];
        var one = bigInt(1);
        var bitLength = e.bitLength().toJSNumber();
        for (var i = 0; i < bitLength; i++) {
            bits.unshift(ecopy.and(one).equals(one));
            ecopy = ecopy.shiftRight(1);
        }
        var pow = F2.fromElements(f_1["default"].fromBig(bigInt(1)), f_1["default"].fromBig(bigInt(0)));
        for (var i = 0; i < bitLength; i++) {
            pow = pow.multiply(pow);
            if (bits[i]) {
                pow = pow.multiply(this);
            }
        }
        return pow;
    };
    //(x0+ry0)*(x1+ry1) = x0x1+nonresidue*y0y1+r*(x0y1+x1y0)
    F2.prototype.multiply = function (b) {
        var f = new F2();
        f.c0 = this.c0.multiply(b.c0).add(f_1["default"].fromBig(defs_1.Defs.nonresidue).multiply(this.c1).multiply(b.c1));
        f.c1 = this.c0.multiply(b.c1).add(this.c1.multiply(b.c0));
        return f;
    };
    F2.prototype.sqrt = function () {
        var pminus1over2 = defs_1.Defs.modulus.subtract(1).over(2);
        var one = f_1["default"].fromBig(bigInt(1));
        var zero = f_1["default"].fromBig(bigInt(0));
        var twoinv = f_1["default"].fromBig(bigInt(2)).inverse();
        if (this.c1.equals(zero)) {
            return F2.fromElements(this.c0.sqrt(), zero);
        }
        var alpha = this.c0.multiply(this.c0).subtract(f_1["default"].fromBig(defs_1.Defs.nonresidue).multiply(this.c1.multiply(this.c1)));
        if (!alpha.power(pminus1over2).equals(one)) {
            throw new Error('doesn\'t have a square root');
        }
        alpha = alpha.sqrt();
        var delta = this.c0.add(alpha).multiply(twoinv);
        if (!delta.power(pminus1over2).equals(one)) {
            delta = delta.subtract(alpha);
        }
        var c0 = delta.sqrt();
        var c0inv = c0.inverse();
        var c1 = this.c1.multiply(twoinv).multiply(c0inv);
        return F2.fromElements(c0, c1);
    };
    F2.one = function () {
        return F2.fromElements(f_1["default"].fromBig(bigInt(1)), f_1["default"].fromBig(bigInt(0)));
    };
    F2.zero = function () {
        return F2.fromElements(f_1["default"].fromBig(bigInt(0)), f_1["default"].fromBig(bigInt(0)));
    };
    F2.prototype.clone = function () {
        return F2.fromElements(this.c0.clone(), this.c1.clone());
    };
    F2.prototype.inverse = function () {
        return this.power(defs_1.Defs.modulus.square().minus(2));
    };
    F2.prototype.negate = function () {
        return F2.fromElements(this.c0.negate(), this.c1.negate());
    };
    F2.prototype.toFs = function () {
        return [this.c0.clone(), this.c1.clone()];
    };
    F2.prototype.toString = function (base) {
        return "F2(" + this.c0.toString(base) + ", " + this.c1.toString(base) + ")";
    };
    return F2;
}());
exports["default"] = F2;
