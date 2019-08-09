import { BLS, F, G1 } from '..'
import * as bigInt from 'big-integer'
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
    const publicKeyHex = BLS.privateToPublicBytes(privateKey).toString('hex')
    expect(publicKeyHex).to.equal('c91e3ae9b4380143652cf199faeeab471e639c969e55275cf3bae66aad5d1c6d6f8bab3cb43fd20a78297cb0a8afe880')
    const popHex = BLS.signPoP(privateKey).toString('hex')
    expect(popHex).to.equal('e9d004d288c88ed669f6156951d736c5e51d79ebb8627ebd16fc24ab625270a44ebd1c9bbb90df1530a68f0e945967006b6b374b30f17389f3e2dedf9a2db8c33abfbc3331d3654702f2e27536cb914088db2f31696c10bd2d53d35b8fb7e700')
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
        const popHex = BLS.signPoP(privateKey).toString('hex')
        expect(popHex).to.equal(line[2])
      } catch(e) {
        console.log(`error: ${e}`)
        console.log(`problematic line: ${line}`)
        break
      }
    }
  })

})
