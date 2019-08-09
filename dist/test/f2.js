"use strict";
exports.__esModule = true;
var __1 = require("..");
var bigInt = require("big-integer");
var chai_1 = require("chai");
require("mocha");
describe('f2', function () {
    it('should add two numbers', function () {
        var a0 = __1.F.fromString('1');
        var a1 = __1.F.fromString('2');
        var fa = __1.F2.fromElements(a0, a1);
        var b0 = __1.F.fromString('2');
        var b1 = __1.F.fromString('3');
        var fb = __1.F2.fromElements(b0, b1);
        var c0 = __1.F.fromString('3');
        var c1 = __1.F.fromString('5');
        var fc = __1.F2.fromElements(c0, c1);
        chai_1.expect(fc.equals(fa.add(fb))).to.be["true"];
    });
    it('should add two numbers with overflow', function () {
        var a0 = __1.F.fromString('5');
        var a1 = __1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176');
        var fa = __1.F2.fromElements(a0, a1);
        var b0 = __1.F.fromString('7');
        var b1 = __1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458175');
        var fb = __1.F2.fromElements(b0, b1);
        var c0 = __1.F.fromString('12');
        var c1 = __1.F.fromString('-3');
        var fc = __1.F2.fromElements(c0, c1);
        chai_1.expect(fc.equals(fa.add(fb))).to.be["true"];
        var d0 = __1.F.fromString('12');
        var d1 = __1.F.fromString('-4');
        var fd = __1.F2.fromElements(d0, d1);
        chai_1.expect(fd.equals(fa.add(fb))).to.be["false"];
    });
    it('should subtract two numbers', function () {
        var a0 = __1.F.fromString('2');
        var a1 = __1.F.fromString('3');
        var fa = __1.F2.fromElements(a0, a1);
        var b0 = __1.F.fromString('1');
        var b1 = __1.F.fromString('2');
        var fb = __1.F2.fromElements(b0, b1);
        var c0 = __1.F.fromString('1');
        var c1 = __1.F.fromString('1');
        var fc = __1.F2.fromElements(c0, c1);
        chai_1.expect(fc.equals(fa.subtract(fb))).to.be["true"];
    });
    it('should subtract two numbers with underflow', function () {
        var a0 = __1.F.fromString('1');
        var a1 = __1.F.fromString('2');
        var fa = __1.F2.fromElements(a0, a1);
        var b0 = __1.F.fromString('2');
        var b1 = __1.F.fromString('4');
        var fb = __1.F2.fromElements(b0, b1);
        var c0 = __1.F.fromString('-1');
        var c1 = __1.F.fromString('-2');
        var fc = __1.F2.fromElements(c0, c1);
        chai_1.expect(fc.equals(fa.subtract(fb))).to.be["true"];
    });
    it('should multiply two numbers', function () {
        var a0 = __1.F.fromString('2');
        var a1 = __1.F.fromString('3');
        var fa = __1.F2.fromElements(a0, a1);
        var b0 = __1.F.fromString('1');
        var b1 = __1.F.fromString('2');
        var fb = __1.F2.fromElements(b0, b1);
        var c0 = __1.F.fromString('-28');
        var c1 = __1.F.fromString('7');
        var fc = __1.F2.fromElements(c0, c1);
        chai_1.expect(fc.equals(fa.multiply(fb))).to.be["true"];
        var d0 = __1.F.fromString('-28');
        var d1 = __1.F.fromString('8');
        var fd = __1.F2.fromElements(d0, d1);
        chai_1.expect(fd.equals(fa.multiply(fb))).to.be["false"];
    });
    it('should exponentiate', function () {
        var a = __1.F2.fromElements(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458175'), __1.F.fromString('0'));
        var b = bigInt('5');
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458145'), __1.F.fromString('0'))
            .equals(a.power(b))).to.be["true"];
        var c = __1.F2.fromElements(__1.F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458175'), __1.F.fromString('2'));
        var d = bigInt('155');
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('65783028405725806735049141297430741823771738803178012631521112383941060855597503934932031247802767016722432'), __1.F.fromString('29113196101550553115890249193640935859209192511620574374823567986743558163512074662866447944927560954019840'))
            .equals(c.power(d))).to.be["true"];
    });
    it('should sqrt', function () {
        var a = __1.F2.fromElements(__1.F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108'), __1.F.fromString('0'));
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('12118840003179210835179577391292122729241172684461133729852601482012023211992350647303872825949683145746068399703'), __1.F.fromString('0')).equals(a.sqrt())).to.be["true"];
        var b = __1.F2.fromElements(__1.F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108'), __1.F.fromString('2'));
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('41419370980669547166359549532146867216515978040162816145969729799820863208721954077760390794061784389677353337838'), __1.F.fromString('185206338313698426281935662345218129485382880659496238771124457028382714828779528153346978193700982256482963380811')).equals(b.sqrt())).to.be["true"];
    });
    it('should invert', function () {
        var a = __1.F2.fromElements(__1.F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108'), __1.F.fromString('1'));
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('197374161382593753503114423900612590693971759274885102512854326262969977873946130506299324094337173454485350541303'), __1.F.fromString('169979707231287650977222045429614735565638446141901841635249209633246938501568054730170608137016423643526847884887')).equals(a.inverse())).to.be["true"];
        var c = __1.F2.fromElements(__1.F.fromString('0'), __1.F.fromString('1'));
        chai_1.expect(__1.F2.fromElements(__1.F.fromString('0'), __1.F.fromString('155198655607781456406391640216936120121836107652948796323930557600032281009004493664981332883744016074664192874906')).equals(c.inverse())).to.be["true"];
    });
});
