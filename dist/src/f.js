"use strict";
exports.__esModule = true;
var bigInt = require("big-integer");
var defs_1 = require("./defs");
var F = /** @class */ (function () {
    function F() {
    }
    F.fromString = function (num, base) {
        var numBig = bigInt(num, base);
        if (numBig.compare(defs_1.Defs.modulus) > 0) {
            throw new Error('number too big');
        }
        var f = new F();
        f.num = numBig;
        return f.makePositive();
    };
    F.fromBig = function (num) {
        if (num.compare(defs_1.Defs.modulus) > 0) {
            throw new Error('number too big');
        }
        var f = new F();
        f.num = bigInt(num);
        return f.makePositive();
    };
    F.prototype.equals = function (b) {
        return (this.num.equals(b.num));
    };
    F.prototype.add = function (b) {
        return F.fromBig(this.num.add(b.num).mod(defs_1.Defs.modulus));
    };
    F.prototype.subtract = function (b) {
        return F.fromBig(this.num.subtract(b.num).mod(defs_1.Defs.modulus)).makePositive();
    };
    F.prototype.multiply = function (b) {
        return F.fromBig(this.num.multiply(b.num).mod(defs_1.Defs.modulus)).makePositive();
    };
    F.prototype.power = function (e) {
        return F.fromBig(this.num.modPow(e, defs_1.Defs.modulus));
    };
    F.prototype.makePositive = function () {
        var f = new F();
        if (this.num.isNegative()) {
            f.num = this.num.add(defs_1.Defs.modulus);
        }
        else {
            f.num = bigInt(this.num);
        }
        return f;
    };
    F.prototype.toBig = function () {
        return bigInt(this.num);
    };
    F.prototype.sqrt = function () {
        var pminus1over2 = defs_1.Defs.modulus.subtract(1).over(2);
        var one = F.fromBig(bigInt(1));
        if (!this.power(pminus1over2).equals(one)) {
            throw new Error('doesn\'t have a square root');
        }
        var t = defs_1.Defs.modulus.subtract(1);
        var s = bigInt(0);
        while (t.isEven()) {
            s = s.next();
            t = t.over(2);
        }
        var z = F.fromBig(defs_1.Defs.nonresidue).power(t);
        var two = bigInt(2);
        var w = this.power(t.subtract(1).over(2));
        var a0 = (w.multiply(w).multiply(this)).power(two.pow(s.subtract(1)));
        if (a0.equals(one.negate())) {
            throw new Error('doesn\'t have a square root');
        }
        var v = bigInt(s);
        var x = this.multiply(w);
        var b = x.multiply(w);
        while (!b.equals(one)) {
            var bb = b.clone();
            var k = void 0;
            for (k = bigInt(0); k.compare(s) < 0; k = k.next()) {
                if (bb.equals(one)) {
                    break;
                }
                bb = bb.power(two);
            }
            if (!bb.equals(one)) {
                throw new Error('couldn\'t find a square root');
            }
            w = z.power(two.pow(v.subtract(k).subtract(1)));
            z = w.multiply(w);
            b = b.multiply(z);
            x = x.multiply(w);
            v = bigInt(k);
        }
        return x;
    };
    F.prototype.inverse = function () {
        return F.fromBig(this.num.modInv(defs_1.Defs.modulus));
    };
    F.prototype.negate = function () {
        return F.fromBig(bigInt(0).subtract(this.num));
    };
    F.one = function () {
        return F.fromBig(bigInt(1));
    };
    F.zero = function () {
        return F.fromBig(bigInt(0));
    };
    F.prototype.clone = function () {
        return F.fromBig(bigInt(this.num));
    };
    F.prototype.toString = function (base) {
        return "F(" + this.num.toString(base) + ")";
    };
    return F;
}());
exports["default"] = F;
