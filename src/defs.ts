import * as bigInt from 'big-integer'
import F from './f'
import F2 from './f2'

export const Defs = {
  modulus: bigInt('258664426012969094010652733694893533536393512754914660539884262666720468348340822774968888139573360124440321458177'),
  nonresidue: bigInt('-5'),
  quadraticNonresidue: [
    bigInt(0),
    bigInt(1),
  ],
  b: bigInt(1),
  bTwist: [
    bigInt(0),
    bigInt('155198655607781456406391640216936120121836107652948796323930557600032281009004493664981332883744016074664192874906'),
  ],
}

export interface FieldSpec<T> {
  equals(b: T): boolean
  add(b: T): T
  subtract(b: T): T
  multiply(b: T): T
  power(e: bigInt.BigInteger): T
  sqrt(): T
  inverse(): T
  negate(): T
  clone(): T
  toString(base?: number): string
}

export interface GroupSpec<T, G> {
  add(p2: G): G
  dbl(): G
  scalarMult(s: bigInt.BigInteger): G
  equals(p2: G): boolean
  toAffine(): G
  x(): T
  y(): T
  z(): T
  toString(base?: number): string
}
