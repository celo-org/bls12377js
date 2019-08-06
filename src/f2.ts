import * as bigInt from 'big-integer'
import { Defs, FieldSpec } from './defs'
import F from './f'

export default class F2 implements FieldSpec<F2> {
  private c0: F
  private c1: F

  static fromElements(c0: F, c1: F): F2 {
    const f: F2 = new F2()
    f.c0 = c0
    f.c1 = c1

    return f
  }

  equals(b: F2): boolean {
    return (this.c0.equals(b.c0) && this.c1.equals(b.c1))
  }

  add(b: F2): F2 {
    const f: F2 = new F2()
    f.c0 = this.c0.add(b.c0)
    f.c1 = this.c1.add(b.c1)
    return f
  }

  subtract(b: F2): F2 {
    const f: F2 = new F2()
    f.c0 = this.c0.subtract(b.c0)
    f.c1 = this.c1.subtract(b.c1)
    return f
  }

  power(e: bigInt.BigInteger): F2 {
    let ecopy = bigInt(e)
    let bits: boolean[] = [];
    const one = bigInt(1)
    const bitLength = e.bitLength().toJSNumber()
    for (let i = 0; i < bitLength; i++) {
      bits.unshift(ecopy.and(one).equals(one))
      ecopy = ecopy.shiftRight(1)
    }

    let pow = F2.fromElements(F.fromBig(bigInt(1)), F.fromBig(bigInt(0)))
    for (let i = 0; i < bitLength; i++) {
      pow = pow.multiply(pow)
      if (bits[i]) {
        pow = pow.multiply(this)
      }
    }

    return pow
  }

  //(x0+ry0)*(x1+ry1) = x0x1+nonresidue*y0y1+r*(x0y1+x1y0)
  multiply(b: F2): F2 {
    const f: F2 = new F2()
    f.c0 = this.c0.multiply(b.c0).add(F.fromBig(Defs.nonresidue).multiply(this.c1).multiply(b.c1))
    f.c1 = this.c0.multiply(b.c1).add(this.c1.multiply(b.c0))
    return f
  }

  sqrt(): F2 {
    const pminus1over2 = Defs.modulus.subtract(1).over(2)
    const one = F.fromBig(bigInt(1))
    const zero = F.fromBig(bigInt(0))
    const twoinv = F.fromBig(bigInt(2)).inverse()
    if (this.c1.equals(zero)) {
      return F2.fromElements(
        this.c0.sqrt(),
        zero,
      )
    }

    let alpha = this.c0.multiply(this.c0).subtract(F.fromBig(Defs.nonresidue).multiply(this.c1.multiply(this.c1)))
    if (!alpha.power(pminus1over2).equals(one)) {
      throw new Error('doesn\'t have a square root')
    }
    alpha = alpha.sqrt()
    let delta = this.c0.add(alpha).multiply(twoinv)
    if (!delta.power(pminus1over2).equals(one)) {
      delta = this.c0.subtract(alpha).multiply(twoinv)
    }

    const c0 = delta.sqrt()
    const c0inv = c0.inverse()
    const c1 = this.c1.multiply(twoinv).multiply(c0inv)
    return F2.fromElements(c0, c1)
  }

  static one(): F2 {
    return F2.fromElements(
      F.fromBig(bigInt(1)),
      F.fromBig(bigInt(0)),
    )
  }

  static zero(): F2 {
    return F2.fromElements(
      F.fromBig(bigInt(0)),
      F.fromBig(bigInt(0)),
    )
  }

  clone(): F2 {
    return F2.fromElements(
      this.c0.clone(),
      this.c1.clone(),
    )
  }

  inverse(): F2 {
    return this.power(Defs.modulus.square().minus(2))
  }

  negate(): F2 {
    return F2.fromElements(
      this.c0.negate(),
      this.c1.negate(),
    )
  }

  private toFs(): F[] {
    return [this.c0.clone(), this.c1.clone()]
  }

  toString(base?: number): string {
    return `F2(${this.c0.toString(base)}, ${this.c1.toString(base)})`
  }
}
