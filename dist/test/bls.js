"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
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
        (0, chai_1.expect)(arr).to.eql([50, 51, 52, 53]);
    });
    it('should test arrayToBuffer', function () {
        var exampleData = new Buffer('32333435', 'hex');
        var arr = [50, 51, 52, 53];
        var buf = __1.BLS.arrayToBuffer(arr);
        (0, chai_1.expect)(exampleData).to.eql(buf);
    });
    it('should test bufferToBig', function () {
        var exampleData = new Buffer('35343332', 'hex');
        var big = __1.BLS.bufferToBig(exampleData);
        (0, chai_1.expect)(big.equals(bigInt('842216501'))).to.be["true"];
        (0, chai_1.expect)(big.equals(bigInt('842216502'))).to.be["false"];
    });
    it('should test bigToBuffer', function () {
        var exampleData = new Buffer('35343332', 'hex');
        var big = bigInt('842216501');
        var buf = __1.BLS.bigToBuffer(big);
        (0, chai_1.expect)(exampleData).to.eql(buf);
    });
    it('should test getMiddlePoint', function () {
        (0, chai_1.expect)(__1.BLS.getMiddlePoint().equals(bigInt('129332213006484547005326366847446766768196756377457330269942131333360234174170411387484444069786680062220160729088'))).to.be["true"];
    });
    it('should test proof of possession', function () {
        var privateKey = new Buffer('e3990a59d80a91429406be0000677a7eea8b96c5b429c70c71dabc3b7cf80d0a', 'hex');
        var address = new Buffer('a0Af2E71cECc248f4a7fD606F203467B500Dd53B', 'hex');
        var popHex = __1.BLS.signPoP(privateKey, address).toString('hex');
        (0, chai_1.expect)(popHex).to.equal('90e5f392c9ad11c7e5ea95e683e0977963b56dcf950cfb28e9780edc7cc527f99fd3e2abfa5ff768a96745704069c580');
    });
    it('should test many proofs of possession', function () {
        var csvContents = fs.readFileSync('test/pops.csv').toString();
        var lines = csvContents.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(',');
            try {
                var privateKey = new Buffer(line[0], 'hex');
                var publicKeyHex = __1.BLS.privateToPublicBytes(privateKey).toString('hex');
                (0, chai_1.expect)(publicKeyHex).to.equal(line[1]);
                var address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex');
                var popHex = __1.BLS.signPoP(privateKey, address).toString('hex');
                (0, chai_1.expect)(popHex).to.equal(line[2]);
            }
            catch (e) {
                console.log("error: " + e);
                console.log("problematic line: " + line);
                throw e;
            }
        }
    });
    it('should test many proofs of possession non compat', function () {
        var csvContents = fs.readFileSync('test/pops_non_compat.csv').toString();
        var lines = csvContents.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(',');
            try {
                var privateKey = new Buffer(line[0], 'hex');
                var publicKeyHex = __1.BLS.privateToPublicBytes(privateKey).toString('hex');
                (0, chai_1.expect)(publicKeyHex).to.equal(line[1]);
                var address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex');
                var popHex = __1.BLS.signPoPNonCompat(privateKey, address).toString('hex');
                (0, chai_1.expect)(popHex).to.equal(line[2]);
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
        (0, chai_1.expect)(publicKey.toAffine()).to.eql(publicKey2.toAffine());
        var exampleData = new Buffer('32333435', 'hex');
        var messagePoint = __1.BLS.tryAndIncrement(new Buffer('ULforpop'), exampleData, true);
        var messagePointCompressed = __1.BLS.compressG1(messagePoint);
        var messagePoint2 = __1.BLS.decompressG1(messagePointCompressed);
        (0, chai_1.expect)(messagePoint.toAffine()).to.eql(messagePoint2.toAffine());
    });
});
