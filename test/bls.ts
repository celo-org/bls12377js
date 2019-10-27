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
    const privateKey = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e61aeca61256ab3d7b3468100b', 'hex')
    const address = new Buffer('60515f8c59451e04ab4b22b3fc9a196b2ad354e6', 'hex')
    const publicKeyHex = BLS.privateToPublicBytes(privateKey).toString('hex')
    expect(publicKeyHex).to.equal('c91e3ae9b4380143652cf199faeeab471e639c969e55275cf3bae66aad5d1c6d6f8bab3cb43fd20a78297cb0a8afe880')
    const popHex = BLS.signPoP(privateKey, address).toString('hex')
    expect(popHex).to.equal('18a20c95582661e366978a7de191ee195685c73b6f5f9ecfd160b10733a7048ab5ab381c381da69cb1de7e530901d500abf4da4a177a6a250d9f4be98e4df21bc9d54f4d4318adaa3eab61ae139e1ec4afc410c44446eab4130196e3dc983201')
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

})
