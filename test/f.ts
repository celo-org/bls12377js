import { F } from '..'
import * as bigInt from 'big-integer'
import { expect } from 'chai'
import 'mocha'

describe('f', () => {
  it('should add two numbers', () => {
    const a = F.fromString('1')
    const b = F.fromString('2')
    expect(F.fromString('3').equals(a.add(b))).to.be.true
  })

  it('should add two numbers with overflow', () => {
    const a = F.fromString('5')
    const b = F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176')
    expect(F.fromString('4').equals(a.add(b))).to.be.true
    expect(F.fromString('1').equals(a.add(b))).to.be.false
  })

  it('should subtract two numbers', () => {
    const a = F.fromString('3')
    const b = F.fromString('2')
    expect(F.fromString('1').equals(a.subtract(b))).to.be.true
  })

  it('should subtract two numbers with underflow', () => {
    const a = F.fromString('4')
    const b = F.fromString('5')
    expect(F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176').equals(a.subtract(b))).to.be.true
  })

  it('should multiply two numbers', () => {
    const a = F.fromString('3')
    const b = F.fromString('2')
    expect(F.fromString('6').equals(a.multiply(b))).to.be.true
  })

  it('should multiply two numbers with overflow', () => {
    const a = F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458176')
    const b = F.fromString('5')
    expect(F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458172').equals(a.multiply(b))).to.be.true
  })

  it('should exponentiate', () => {
    const a = F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458175')
    const b = bigInt('5')
    expect(F.fromString('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458145').equals(a.power(b))).to.be.true
  })

  it('should sqrt', () => {
    const a = F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108')
    expect(F.fromString('12118840003179210835179577391292122729241172684461133729852601482012023211992350647303872825949683145746068399703').equals(a.sqrt())).to.be.true
  })

  it('should invert', () => {
    const a = F.fromString('550736215299214760761299796673629199118957992852761654046374244889044835108')
    expect(F.fromString('198211322775767985983130790957179162356786054453194757809753470507963657387483076302390854404300224470401701908010').equals(a.inverse())).to.be.true
  })
})
