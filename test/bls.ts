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
    const privateKey = new Buffer('e3990a59d80a91429406be0000677a7eea8b96c5b429c70c71dabc3b7cf80d0a', 'hex')
    const address = new Buffer('a0Af2E71cECc248f4a7fD606F203467B500Dd53B', 'hex')
    const popHex = BLS.signPoP(privateKey, address).toString('hex')
    expect(popHex).to.equal('90e5f392c9ad11c7e5ea95e683e0977963b56dcf950cfb28e9780edc7cc527f99fd3e2abfa5ff768a96745704069c580')
  })

  it.skip('should test many proofs of possession', () => {
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
