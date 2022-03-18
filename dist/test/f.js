"use strict";
exports.__esModule = true;
var __1 = require("..");
var bigInt = require("big-integer");
var chai_1 = require("chai");
require("mocha");
describe('f', function () {
    it('should add two numbers', function () {
        var a = __1.F.fromString('1');
        var b = __1.F.fromString('2');
        (0, chai_1.expect)(__1.F.fromString('3').equals(a.add(b))).to.be["true"];
    });
    it('should add two numbers with overflow', function () {
        var a = __1.F.fromString('5');
        var b = __1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176');
        (0, chai_1.expect)(__1.F.fromString('4').equals(a.add(b))).to.be["true"];
        (0, chai_1.expect)(__1.F.fromString('1').equals(a.add(b))).to.be["false"];
    });
    it('should subtract two numbers', function () {
        var a = __1.F.fromString('3');
        var b = __1.F.fromString('2');
        (0, chai_1.expect)(__1.F.fromString('1').equals(a.subtract(b))).to.be["true"];
    });
    it('should subtract two numbers with underflow', function () {
        var a = __1.F.fromString('4');
        var b = __1.F.fromString('5');
        (0, chai_1.expect)(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176').equals(a.subtract(b))).to.be["true"];
    });
    it('should multiply two numbers', function () {
        var a = __1.F.fromString('3');
        var b = __1.F.fromString('2');
        (0, chai_1.expect)(__1.F.fromString('6').equals(a.multiply(b))).to.be["true"];
    });
    it('should multiply two numbers with overflow', function () {
        var a = __1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176');
        var b = __1.F.fromString('5');
        (0, chai_1.expect)(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458172').equals(a.multiply(b))).to.be["true"];
    });
    it('should exponentiate', function () {
        var a = __1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458175');
        var b = bigInt('5');
        (0, chai_1.expect)(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458145').equals(a.power(b))).to.be["true"];
    });
    it('should sqrt', function () {
        var a = __1.F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108');
        (0, chai_1.expect)(__1.F.fromString('12118840003179210835179577391292122729241172684461133729852601482012023211992350647303872825949683145746068399703').equals(a.sqrt())).to.be["true"];
    });
    it('should invert', function () {
        var a = __1.F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108');
        (0, chai_1.expect)(__1.F.fromString('198211322775767985983130790957179162356786054453194757809753470507963657387483076302390854404300224470401701908010').equals(a.inverse())).to.be["true"];
    });
});
