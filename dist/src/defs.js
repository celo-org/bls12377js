"use strict";
exports.__esModule = true;
var bigInt = require("big-integer");
exports.Defs = {
    modulus: bigInt('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458177'),
    nonresidue: bigInt('-5'),
    quadraticNonresidue: [
        bigInt(0),
        bigInt(1),
    ],
    fByteSize: 48,
    b: bigInt(1),
    bTwist: [
        bigInt(0),
        bigInt('155198655607781456406391640216936120121836107652948796323930557600032281009004493664981332883744016074664192874906'),
    ],
    g1Generator: [
        bigInt('81937999373150964239938255573465948239988671502647976594219695644855304257327692006745978603320413799295628339695'),
        bigInt('241266749859715473739788878240585681733927191168601896383759122102112907357779751001206799952863815012735208165030'),
    ],
    g2Generator: [
        [
            bigInt('233578398248691099356572568220835526895379068987715365179118596935057653620464273615301663571204657964920925606294'),
            bigInt('140913150380207355837477652521042157274541796891053068589147167627541651775299824604154852141315666357241556069118'),
        ],
        [
            bigInt('63160294768292073209381361943935198908131692476676907196754037919244929611450776219210369229519898517858833747423'),
            bigInt('149157405641012693445398062341192467754805999074082136895788947234480009303640899064710353187729182149407503257491'),
        ],
    ],
    g2Cofactor: bigInt('7923214915284317143930293550643874566881017850177945424769256759165301436616933228209277966774092486467289478618404761412630691835764674559376407658497'),
    blsX: bigInt('8508c00000000001', 16)
};
