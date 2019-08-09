import bigInt = require('big-integer')
import { Defs, FieldSpec } from './defs'

export default class F implements FieldSpec<F> {
  // @ts-ignore
  private num: bigInt.BigInteger

  private constructor() {}

  static fromString(num: string, base?: number): F {
    const numBig = bigInt(num, base)
    if (numBig.compare(Defs.modulus) > 0) {
      throw new Error('number too big')
    }
    const f: F = new F()
    f.num = numBig
    return f.makePositive()
  }

  static fromBig(num: bigInt.BigInteger): F {
    if (num.compare(Defs.modulus) > 0) {
      throw new Error('number too big')
    }
    const f: F = new F()
    f.num = bigInt(num)

    return f.makePositive()
  }

  equals(b: F): boolean {
    return (this.num.equals(b.num))
  }

  add(b: F): F {
    return F.fromBig(this.num.add(b.num).mod(Defs.modulus))
  }

  subtract(b: F): F {
    return F.fromBig(this.num.subtract(b.num).mod(Defs.modulus)).makePositive()
  }

  multiply(b: F): F {
    return F.fromBig(this.num.multiply(b.num).mod(Defs.modulus)).makePositive()
  }

  power(e: bigInt.BigInteger): F {
    return F.fromBig(this.num.modPow(e, Defs.modulus))
  }

  private makePositive(): F {
    const f = new F();
    if (this.num.isNegative()) {
      f.num = this.num.add(Defs.modulus)
    } else {
      f.num = bigInt(this.num)
    }

    return f
  }

  toBig(): bigInt.BigInteger {
    return bigInt(this.num)
  }

  sqrt(): F {
    const pminus1over2 = Defs.modulus.subtract(1).over(2)
    const one = F.fromBig(bigInt(1))
    if (!this.power(pminus1over2).equals(one)) {
      throw new Error('doesn\'t have a square root')
    }
    let t = Defs.modulus.subtract(1)
    let s = bigInt(0)
    while (t.isEven()) {
      s = s.next()
      t = t.over(2)
    }
    let z = F.fromBig(Defs.nonresidue).power(t)

    const two = bigInt(2)
    let w = this.power(t.subtract(1).over(2))
    let a0 = (w.multiply(w).multiply(this)).power(two.pow(s.subtract(1)))
    if (a0.equals(one.negate())) {
      throw new Error('doesn\'t have a square root')
    }

    let v = bigInt(s)
    let x = this.multiply(w)
    let b = x.multiply(w)


    while (!b.equals(one)) {
      let bb = b.clone()
      let k;
      for (k = bigInt(0); k.compare(s) < 0; k = k.next()) {
        if (bb.equals(one)) {
          break
        }
        bb = bb.power(two)
      }
      if (!bb.equals(one)) {
        throw new Error('couldn\'t find a square root')
      }
      w = z.power(two.pow(v.subtract(k).subtract(1)))
      z = w.multiply(w)
      b = b.multiply(z)
      x = x.multiply(w)
      v = bigInt(k)
    }
    return x
  }

  inverse(): F {
    return F.fromBig(this.num.modInv(Defs.modulus))
  }

  negate(): F {
    return F.fromBig(bigInt(0).subtract(this.num))
  }

  static one(): F {
    return F.fromBig(bigInt(1))
  }

  static zero(): F {
    return F.fromBig(bigInt(0))
  }

  clone(): F {
    return F.fromBig(bigInt(this.num))
  }

  toString(base?: number): string {
    return `F(${this.num.toString(base)})`
  }
}
