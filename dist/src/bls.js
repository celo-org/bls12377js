"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var defs_1 = require("./defs");
var bigInt = require("big-integer");
var f_1 = __importDefault(require("./f"));
var f2_1 = __importDefault(require("./f2"));
var g1_1 = __importDefault(require("./g1"));
var g2_1 = __importDefault(require("./g2"));
var BLAKE2sImport = __importStar(require("blake2s-js"));
var BLAKE2s = BLAKE2sImport;
function reverse(src) {
    var buffer = new Buffer(src.length);
    for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j];
        buffer[j] = src[i];
    }
    return buffer;
}
exports.reverse = reverse;
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
    var publicKeyBytes = compressG1(g1Generator().scalarMult(privateKeyBig));
    return publicKeyBytes;
}
exports.privateToPublicBytes = privateToPublicBytes;
function signPoP(privateKey) {
    var privateKeyBig = bufferToBig(privateKey);
    var publicKeyBytes = privateToPublicBytes(privateKey);
    var messagePoint = tryAndIncrement(new Buffer('096b36a5804bfacef1691e173c366a47ff5ba84a44f26ddd7e8d9f79d5b42df0'), new Buffer('ULforpop'), publicKeyBytes);
    var signedMessage = messagePoint.scalarMult(privateKeyBig);
    var scalingFactor = defs_1.Defs.blsX.multiply(defs_1.Defs.blsX).subtract(bigInt(1)).multiply(3).multiply(defs_1.Defs.g2Cofactor);
    var signedMessageScaled = signedMessage.scalarMult(scalingFactor);
    var signatureBytes = compressG2(signedMessageScaled);
    return signatureBytes;
}
exports.signPoP = signPoP;
function crh(message) {
    return Buffer.from((new BLAKE2s(32))
        .update(message)
        .digest());
    return new Buffer(0);
}
exports.crh = crh;
function prf(key, domain, messageHash) {
    var result = new Buffer(0);
    for (var i = 0; i < 3; i++) {
        var counter = new Buffer(1);
        counter[0] = i;
        var buf = Buffer.concat([
            key,
            counter,
            messageHash,
        ]);
        var hash = Buffer.from((new BLAKE2s(32, { personalization: domain }))
            .update(buf)
            .digest());
        result = Buffer.concat([result, hash]);
    }
    return result;
}
exports.prf = prf;
function tryAndIncrement(key, domain, message) {
    var messageHash = crh(message);
    for (var i = 0; i < 256; i++) {
        var counter = new Buffer(1);
        counter[0] = i;
        var hash = prf(key, domain, Buffer.concat([
            counter,
            messageHash,
        ]));
        var possibleX0Bytes = hash.slice(0, hash.length / 2);
        possibleX0Bytes[possibleX0Bytes.length - 1] &= 1;
        var possibleX0Big = bufferToBig(possibleX0Bytes);
        var possibleX0 = void 0;
        try {
            possibleX0 = f_1["default"].fromBig(possibleX0Big);
        }
        catch (e) {
            continue;
        }
        var possibleX1Bytes = hash.slice(hash.length / 2, hash.length);
        var greatest = (possibleX1Bytes[possibleX1Bytes.length - 1] & 2) == 2;
        possibleX1Bytes[possibleX1Bytes.length - 1] &= 1;
        var possibleX1Big = bufferToBig(possibleX1Bytes);
        var possibleX1 = void 0;
        try {
            possibleX1 = f_1["default"].fromBig(possibleX1Big);
        }
        catch (e) {
            continue;
        }
        var possibleX = f2_1["default"].fromElements(possibleX0, possibleX1);
        var y = void 0;
        try {
            y = (possibleX.multiply(possibleX).multiply(possibleX).add(f2_1["default"].fromElements(f_1["default"].fromBig(defs_1.Defs.bTwist[0]), f_1["default"].fromBig(defs_1.Defs.bTwist[1])))).sqrt();
            var negy = y.negate().toFs();
            var negy0 = negy[0].toBig();
            var negy1 = negy[1].toBig();
            var negyIsGreatest = false;
            if (negy1.compare(getMiddlePoint()) > 0) {
                negyIsGreatest = true;
            }
            else if ((negy1.compare(getMiddlePoint()) == 0) &&
                (negy0.compare(getMiddlePoint()) > 0)) {
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
        return g2_1["default"].fromElements(possibleX, y);
    }
    throw new Error('couldn\'t sign pop');
}
exports.tryAndIncrement = tryAndIncrement;
