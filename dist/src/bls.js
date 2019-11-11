"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var defs_1 = require("./defs");
var bigInt = require("big-integer");
var f_1 = __importDefault(require("./f"));
var f2_1 = __importDefault(require("./f2"));
var g1_1 = __importDefault(require("./g1"));
var g2_1 = __importDefault(require("./g2"));
var blake2xs_1 = require("@stablelib/blake2xs");
function reverse(src) {
    var buffer = new Buffer(src.length);
    for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j];
        buffer[j] = src[i];
    }
    return buffer;
}
exports.reverse = reverse;
function uint8ArrayToBuffer(src) {
    var buffer = new Buffer(src.length);
    for (var i = 0; i < src.length; i++) {
        buffer[i] = src[i];
    }
    return buffer;
}
exports.uint8ArrayToBuffer = uint8ArrayToBuffer;
function bufferToArray(buf) {
    return buf.toJSON().data;
}
exports.bufferToArray = bufferToArray;
function arrayToBuffer(arr) {
    return new Buffer(arr);
}
exports.arrayToBuffer = arrayToBuffer;
function bufferToBig(buf) {
    var arr = bufferToArray(reverse(buf));
    return bigInt.fromArray(arr, 256);
}
exports.bufferToBig = bufferToBig;
function bigToBuffer(num) {
    var arr = num.toArray(256).value;
    return reverse(arrayToBuffer(arr));
}
exports.bigToBuffer = bigToBuffer;
function getMiddlePoint() {
    var modulus = bigInt(defs_1.Defs.modulus);
    return modulus.subtract(1).over(2);
}
exports.getMiddlePoint = getMiddlePoint;
function compressG1(g) {
    var gAffine = g.toAffine();
    var x = padBytes(bigToBuffer(gAffine.x().toBig()), defs_1.Defs.fByteSize);
    var y = gAffine.y().toBig();
    if (y.compare(getMiddlePoint()) > 0) {
        x[x.length - 1] |= 0x80;
    }
    return x;
}
exports.compressG1 = compressG1;
function compressG2(g) {
    var gAffine = g.toAffine();
    var x = gAffine.x().toFs();
    var x0 = padBytes(bigToBuffer(x[0].toBig()), defs_1.Defs.fByteSize);
    var x1 = padBytes(bigToBuffer(x[1].toBig()), defs_1.Defs.fByteSize);
    var y = gAffine.y().toFs();
    var y0 = y[0].toBig();
    var y1 = y[1].toBig();
    var xBytes = Buffer.concat([x0, x1]);
    if (y1.compare(getMiddlePoint()) > 0) {
        xBytes[xBytes.length - 1] |= 0x80;
    }
    else if ((y1.compare(getMiddlePoint()) == 0) &&
        (y0.compare(getMiddlePoint()) > 0)) {
        xBytes[xBytes.length - 1] |= 0x80;
    }
    return xBytes;
}
exports.compressG2 = compressG2;
function g1Generator() {
    return g1_1["default"].fromElements(f_1["default"].fromBig(defs_1.Defs.g1Generator[0]), f_1["default"].fromBig(defs_1.Defs.g1Generator[1]));
}
exports.g1Generator = g1Generator;
function g2Generator() {
    return g2_1["default"].fromElements(f2_1["default"].fromElements(f_1["default"].fromBig(defs_1.Defs.g2Generator[0][0]), f_1["default"].fromBig(defs_1.Defs.g2Generator[0][1])), f2_1["default"].fromElements(f_1["default"].fromBig(defs_1.Defs.g2Generator[1][0]), f_1["default"].fromBig(defs_1.Defs.g2Generator[1][1])));
}
exports.g2Generator = g2Generator;
function padBytes(buf, expectedLength) {
    var result = new Buffer(buf);
    while (result.length < expectedLength) {
        result = Buffer.concat([
            result,
            new Buffer(1),
        ]);
    }
    return result;
}
exports.padBytes = padBytes;
function privateToPublicBytes(privateKey) {
    var privateKeyBig = bufferToBig(privateKey);
    var publicKeyBytes = compressG2(g2Generator().scalarMult(privateKeyBig));
    return publicKeyBytes;
}
exports.privateToPublicBytes = privateToPublicBytes;
function signPoP(privateKey, address) {
    var privateKeyBig = bufferToBig(privateKey);
    var messagePoint = tryAndIncrement(new Buffer('ULforpop'), address);
    var signedMessage = messagePoint.scalarMult(privateKeyBig);
    var signedMessageScaled = signedMessage.scalarMult(defs_1.Defs.g1Cofactor);
    var signatureBytes = compressG1(signedMessageScaled);
    return signatureBytes;
}
exports.signPoP = signPoP;
function tryAndIncrement(domain, message) {
    var xofDigestLength = 384 / 8;
    for (var i = 0; i < 256; i++) {
        var counter = new Buffer(1);
        counter[0] = i;
        var messageWithCounter = Buffer.concat([
            counter,
            message,
        ]);
        var hash = uint8ArrayToBuffer((new blake2xs_1.BLAKE2Xs(xofDigestLength, { personalization: domain })).update(messageWithCounter).digest());
        var possibleXBytes = hash;
        possibleXBytes[possibleXBytes.length - 1] &= 1;
        var possibleXBig = bufferToBig(possibleXBytes);
        var possibleX = void 0;
        try {
            possibleX = f_1["default"].fromBig(possibleXBig);
        }
        catch (e) {
            continue;
        }
        var greatest = (possibleXBytes[possibleXBytes.length - 1] & 2) == 2;
        var y = void 0;
        try {
            y = (possibleX.multiply(possibleX).multiply(possibleX).add(f_1["default"].fromBig(bigInt(1)))).sqrt();
            var negy = y.negate().toBig();
            var negyIsGreatest = false;
            if (negy.compare(getMiddlePoint()) > 0) {
                negyIsGreatest = true;
            }
            if (negyIsGreatest && greatest) {
                y = y.negate();
            }
            if (!negyIsGreatest && !greatest) {
                y = y.negate();
            }
        }
        catch (e) {
            continue;
        }
        return g1_1["default"].fromElements(possibleX, y);
    }
    throw new Error('couldn\'t sign pop');
}
exports.tryAndIncrement = tryAndIncrement;
