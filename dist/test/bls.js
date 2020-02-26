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
        var privateKey = new Buffer('37be4cee3e4322bcbcf4daf48c3315e2bb08b134edfcba2f9294940b2553700e', 'hex');
        var address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex');
        var publicKeyHex = __1.BLS.privateToPublicBytes(privateKey).toString('hex');
        chai_1.expect(publicKeyHex).to.equal('5a9f0f97d8e00fcd54f31cf4bad81599306fefedbc1a29ac5e47261e5a44f6369bfbcd7dc77234913626608594bcf10049d8ab6dfc62b257e77c8775f2adc2e3e13683137c899cf2f9bd97adf8568649d1ac152762b664a37be865fa7f997401');
        var popHex = __1.BLS.signPoP(privateKey, address).toString('hex');
        chai_1.expect(popHex).to.equal('ee4d9108ae684014dbc080d7bbf201e86361de6f12337715f344fc7e104881da2df2a0a363bacc303219ba0be1d09a81');
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
                var address = new Buffer('47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95', 'hex');
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
    it('should test compression', function () {
        var privateKey = new Buffer('37be4cee3e4322bcbcf4daf48c3315e2bb08b134edfcba2f9294940b2553700e', 'hex');
        var privateKeyBig = __1.BLS.bufferToBig(privateKey);
        var publicKey = __1.BLS.g2Generator().scalarMult(privateKeyBig);
        var publicKeyCompressed = __1.BLS.compressG2(publicKey);
        var publicKey2 = __1.BLS.decompressG2(publicKeyCompressed);
        chai_1.expect(publicKey.toAffine()).to.eql(publicKey2.toAffine());
        var exampleData = new Buffer('32333435', 'hex');
        var messagePoint = __1.BLS.tryAndIncrement(new Buffer('ULforpop'), exampleData);
        var messagePointCompressed = __1.BLS.compressG1(messagePoint);
        var messagePoint2 = __1.BLS.decompressG1(messagePointCompressed);
        chai_1.expect(messagePoint.toAffine()).to.eql(messagePoint2.toAffine());
    });
});
