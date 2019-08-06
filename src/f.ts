import * as bigInt from 'big-integer'
import { Defs, FieldSpec } from './defs'

export default class F implements FieldSpec<F> {
  private num: bigInt.BigInteger

  static fromString(num: string, base?: number): F {
    const f: F = new F()
    f.num = bigInt(num, base).mod(Defs.modulus)
    return f.makePositive()
  }

  static fromBig(num: bigInt.BigInteger): F {
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

  private toBig(): bigInt.BigInteger {
    return bigInt(this.num)
  }

  sqrt(): F {
    const pminus1over2 = Defs.modulus.subtract(1).over(2)
    const one = F.fromBig(bigInt(1))
    const zero = F.fromBig(bigInt(0))
    if (!this.power(pminus1over2).equals(one)) {
      throw new Error('doesn\'t have a square root')
    }
    let Q = Defs.modulus.subtract(1)
    let S = bigInt(0)
    while (Q.isEven()) {
      S = S.next()
      Q = Q.over(2)
    }

    let M = bigInt(S)
    let c = F.fromBig(Defs.nonresidue).power(Q)
    let t = this.power(Q)
    let R = this.power(Q.add(1).over(2))
    const two = bigInt(2)

    while (true) {
      if (t.equals(zero)) {
        return zero
      }
      if (t.equals(one)) {
        return R
      }

      let tt = t.clone()
      let i;
      for (i = bigInt(0); i.compare(M) < 0; i = i.next()) {
        if (tt.equals(one)) {
          break
        }
        tt = tt.power(two)
      }
      if (!tt.equals(one)) {
        throw new Error('couldn\'t find a square root')
      }
      let b = c.power(two.pow(M.subtract(i).subtract(1)))
      M = bigInt(i)
      c = b.power(two)
      t = t.multiply(c)
      R = R.multiply(b)
    }
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
