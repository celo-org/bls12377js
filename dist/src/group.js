"use strict";
exports.__esModule = true;
var bigInt = require("big-integer");
var Group = /** @class */ (function () {
    function Group() {
    }
    Group.fromElements = function (b, zero, one, x, y, z) {
        var isOnCurve = y.multiply(y).equals(x.multiply(x).multiply(x).add(b));
        var isInfinity = x.equals(zero) && y.equals(one) && z.equals(zero);
        if (!isOnCurve && !isInfinity) {
            throw new Error('not on curve');
        }
        var p = new Group();
        p._x = x.clone();
        p._y = y.clone();
        p._z = z.clone();
        return p;
    };
    Group.prototype.x = function () {
        return this._x.clone();
    };
    Group.prototype.y = function () {
        return this._y.clone();
    };
    Group.prototype.z = function () {
        return this._z.clone();
    };
    Group.prototype._add = function (b, zero, one, p2) {
        if (this.isInfinity(zero, one)) {
            return p2.clone();
        }
        else if (p2.isInfinity(zero, one)) {
            return this.clone();
        }
        else if (this.equals(p2)) {
            return this._double(b, zero, one);
        }
        var y1z2 = this.y().multiply(p2.z());
        var x1z2 = this.x().multiply(p2.z());
        var z1z2 = this.z().multiply(p2.z());
        var u = p2.y().multiply(this.z()).subtract(y1z2);
        var uu = u.multiply(u);
        var v = p2.x().multiply(this.z()).subtract(x1z2);
        var vv = v.multiply(v);
        var vvv = vv.multiply(v);
        var R = vv.multiply(x1z2);
        var A = uu.multiply(z1z2).subtract(vvv).subtract(R.add(R));
        var X3 = v.multiply(A);
        var Y3 = u.multiply(R.subtract(A)).subtract(vvv.multiply(y1z2));
        var Z3 = vvv.multiply(z1z2);
        var p3 = new Group();
        p3._x = X3;
        p3._y = Y3;
        p3._z = Z3;
        return p3;
    };
    Group.prototype._double = function (_, zero, one) {
        if (this.isInfinity(zero, one)) {
            return this.clone();
        }
        var XX = this.x().multiply(this.x());
        var w = XX.add(XX).add(XX);
        var y1z1 = this.y().multiply(this.z());
        var s = y1z1.add(y1z1);
        var ss = s.multiply(s);
        var sss = ss.multiply(s);
        var R = this.y().multiply(s);
        var RR = R.multiply(R);
        var X1R = this.x().add(R);
        var B = X1R.multiply(X1R).subtract(XX).subtract(RR);
        var h = w.multiply(w).subtract(B).subtract(B);
        var X3 = h.multiply(s);
        var Y3 = w.multiply(B.subtract(h)).subtract(RR).subtract(RR);
        var Z3 = sss;
        var p3 = new Group();
        p3._x = X3;
        p3._y = Y3;
        p3._z = Z3;
        return p3;
    };
    Group.prototype._scalarMult = function (b, infinity, zero, one, s) {
        var scopy = bigInt(s);
        var bits = [];
        var bone = bigInt(1);
        var bitLength = s.bitLength().toJSNumber();
        for (var i = 0; i < bitLength; i++) {
            bits.unshift(scopy.and(bone).equals(bone));
            scopy = scopy.shiftRight(1);
        }
        var sum = infinity;
        for (var i = 0; i < bitLength; i++) {
            sum = sum._double(b, zero, one);
            if (bits[i]) {
                sum = sum._add(b, zero, one, this);
            }
        }
        return sum;
    };
    Group.prototype.toAffine = function () {
        var p = new Group();
        var zinv = this.z().inverse();
        p._x = this.x().multiply(zinv);
        p._y = this.y().multiply(zinv);
        p._z = this.z().multiply(zinv);
        return p;
    };
    Group.prototype.equals = function (p2) {
        return this.x().multiply(p2.z()).equals(p2.x().multiply(this.z())) &&
            this.y().multiply(p2.z()).equals(p2.y().multiply(this.z()));
    };
    Group.prototype.equalsProjective = function (p2) {
        return (this.x().equals(p2.x()) && this.y().equals(p2.y()) && this.z().equals(p2.z()));
    };
    Group.prototype.isInfinity = function (zero, one) {
        return (this.x().equals(zero) && this.y().equals(one) && this.z().equals(zero));
    };
    Group.prototype.clone = function () {
        var p = new Group();
        p._x = this.x();
        p._y = this.y();
        p._z = this.z();
        return p;
    };
    Group.prototype.toString = function (base) {
        return "G(" + this.x().toString(base) + ", " + this.y().toString(base) + ", " + this.z().toString(base) + ")";
    };
    return Group;
}());
exports["default"] = Group;
