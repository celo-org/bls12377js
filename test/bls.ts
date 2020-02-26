import { BLS } from '..'
import bigInt = require('big-integer')
import * as fs from 'fs';
import { expect } from 'chai'
import 'mocha'

describe('bls', () => {
  it('should test bufferToArray', () => {
    const exampleData = new Buffer('32333435', 'hex')
    const arr = BLS.bufferToArray(exampleData)
    expect(arr).to.eql([50, 51, 52, 53])
  })

  it('should test arrayToBuffer', () => {
    const exampleData = new Buffer('32333435', 'hex')
    const arr: number[] = [50, 51, 52, 53]
    const buf = BLS.arrayToBuffer(arr)
    expect(exampleData).to.eql(buf)
  })

  it('should test bufferToBig', () => {
    const exampleData = new Buffer('35343332', 'hex')
    const big = BLS.bufferToBig(exampleData)
    expect(big.equals(bigInt('842216501'))).to.be.true
    expect(big.equals(bigInt('842216502'))).to.be.false
  })

  it('should test bigToBuffer', () => {
    const exampleData = new Buffer('35343332', 'hex')
    const big = bigInt('842216501')
    const buf = BLS.bigToBuffer(big)
    expect(exampleData).to.eql(buf)
  })

  it('should test getMiddlePoint', () => {
    expect(BLS.getMiddlePoint().equals(bigInt('129332213006484547005326366847446766768196756377457330269942131333360234174170411387484444069786680062220160729088'))).to.be.true
  })

  it('should test proof of possession', () => {
    const privateKey = new Buffer('37be4cee3e4322bcbcf4daf48c3315e2bb08b134edfcba2f9294940b2553700e', 'hex')
    const address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex')
    const publicKeyHex = BLS.privateToPublicBytes(privateKey).toString('hex')
    expect(publicKeyHex).to.equal('5a9f0f97d8e00fcd54f31cf4bad81599306fefedbc1a29ac5e47261e5a44f6369bfbcd7dc77234913626608594bcf10049d8ab6dfc62b257e77c8775f2adc2e3e13683137c899cf2f9bd97adf8568649d1ac152762b664a37be865fa7f997401')
    const popHex = BLS.signPoP(privateKey, address).toString('hex')
    expect(popHex).to.equal('ee4d9108ae684014dbc080d7bbf201e86361de6f12337715f344fc7e104881da2df2a0a363bacc303219ba0be1d09a81')
  })

  it('should test many proofs of possession', () => {
    const csvContents = fs.readFileSync('test/pops.csv').toString()
    const lines = csvContents.trim().split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].split(',')
      try {
        const privateKey = new Buffer(line[0], 'hex')
        const publicKeyHex = BLS.privateToPublicBytes(privateKey).toString('hex')
        expect(publicKeyHex).to.equal(line[1])
        const address = new Buffer('47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95', 'hex')
        const popHex = BLS.signPoP(privateKey, address).toString('hex')
        expect(popHex).to.equal(line[2])
      } catch(e) {
        console.log(`error: ${e}`)
        console.log(`problematic line: ${line}`)
        throw e;
      }
    }
  })

  it('should test compression', () => {
    const privateKey = new Buffer('37be4cee3e4322bcbcf4daf48c3315e2bb08b134edfcba2f9294940b2553700e', 'hex')
    const privateKeyBig = BLS.bufferToBig(privateKey)
    const publicKey = BLS.g2Generator().scalarMult(privateKeyBig)
    const publicKeyCompressed = BLS.compressG2(publicKey)
    const publicKey2 = BLS.decompressG2(publicKeyCompressed)
    expect(publicKey.toAffine()).to.eql(publicKey2.toAffine())

    const exampleData = new Buffer('32333435', 'hex')
    const messagePoint = BLS.tryAndIncrement(
      new Buffer('ULforpop'),
      exampleData,
    )
    const messagePointCompressed = BLS.compressG1(messagePoint)
    const messagePoint2 = BLS.decompressG1(messagePointCompressed)
    expect(messagePoint.toAffine()).to.eql(messagePoint2.toAffine())
  })

})
