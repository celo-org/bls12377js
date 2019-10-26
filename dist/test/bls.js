"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var __1 = require("..");
var bigInt = require("big-integer");
var fs = __importStar(require("fs"));
var chai_1 = require("chai");
require("mocha");
describe('bls', function () {
    it('should test bufferToArray', function () {
        var exampleData = new Buffer('32333435', 'hex');
        var arr = __1.BLS.bufferToArray(exampleData);
        chai_1.expect(arr).to.eql([50, 51, 52, 53]);
    });
    it('should test arrayToBuffer', function () {
        var exampleData = new Buffer('32333435', 'hex');
        var arr = [50, 51, 52, 53];
        var buf = __1.BLS.arrayToBuffer(arr);
        chai_1.expect(exampleData).to.eql(buf);
    });
    it('should test bufferToBig', function () {
        var exampleData = new Buffer('35343332', 'hex');
        var big = __1.BLS.bufferToBig(exampleData);
        chai_1.expect(big.equals(bigInt('842216501'))).to.be["true"];
        chai_1.expect(big.equals(bigInt('842216502'))).to.be["false"];
    });
    it('should test bigToBuffer', function () {
        var exampleData = new Buffer('35343332', 'hex');
        var big = bigInt('842216501');
        var buf = __1.BLS.bigToBuffer(big);
        chai_1.expect(exampleData).to.eql(buf);
    });
    it('should test getMiddlePoint', function () {
        chai_1.expect(__1.BLS.getMiddlePoint().equals(bigInt('129332213006484547005326366847446766768196756377457330269942131333360234174170411387484444069786680062220160729088'))).to.be["true"];
    });
    it('should test proof of possession', function () {
        var privateKey = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e61aeca61256ab3d7b3468100b', 'hex');
        var address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex');
        var publicKeyHex = __1.BLS.privateToPublicBytes(privateKey).toString('hex');
        chai_1.expect(publicKeyHex).to.equal('c91e3ae9b4380143652cf199faeeab471e639c969e55275cf3bae66aad5d1c6d6f8bab3cb43fd20a78297cb0a8afe880');
        var popHex = __1.BLS.signPoP(privateKey, address).toString('hex');
        chai_1.expect(popHex).to.equal('5ce47b7cd8143dfa28687ad5b5c1b586ff955e5d97511c772db5f0c860daf7a72590b6b4f6bf261de81e7deb8dec1e01c404f122be49b3ff84e0c72bf7ffdfac7465046981beb368bf5041cc3a598e831f99960d81210135871c8f6ac357a180');
    });
    it('should test many proofs of possession', function () {
        var csvContents = fs.readFileSync('test/pops.csv').toString();
        var lines = csvContents.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(',');
            try {
                var privateKey = new Buffer(line[0], 'hex');
                var publicKeyHex = __1.BLS.privateToPublicBytes(privateKey).toString('hex');
                chai_1.expect(publicKeyHex).to.equal(line[1]);
                var address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex');
                var popHex = __1.BLS.signPoP(privateKey, address).toString('hex');
                chai_1.expect(popHex).to.equal(line[2]);
            }
            catch (e) {
                console.log("error: " + e);
                console.log("problematic line: " + line);
                throw e;
            }
        }
    });
});
