import * as bigInt from 'big-integer'
import { Defs, FieldSpec } from './defs'

export default class Group<T extends FieldSpec<T>> {
  private _x: T
  private _y: T
  private _z: T

  static fromElements<T extends FieldSpec<T>>(b: T, zero: T, one: T, x: T, y: T, z: T): Group<T> {
    const isOnCurve = y.multiply(y).equals(x.multiply(x).multiply(x).add(b))
    const isInfinity = x.equals(zero) && y.equals(one) && z.equals(zero)
    if (!isOnCurve && !isInfinity) {
      throw new Error('not on curve')
    }
    const p: Group<T> = new Group<T>()
    p._x = x.clone()
    p._y = y.clone()
    p._z = z.clone()

    return p
  }

  x(): T {
    return this._x.clone()
  }

  y(): T {
    return this._y.clone()
  }

  z(): T {
    return this._z.clone()
  }

  _add(b: T, zero: T, one: T, p2: Group<T>): Group<T> {
    if (this.isInfinity(zero, one)) {
      return p2.clone()
    } else if (p2.isInfinity(zero, one)) {
      return this.clone()
    } else if (this.equals(p2)) {
      return this._double(b, zero, one)
    }
    const y1z2 = this.y().multiply(p2.z())
    const x1z2 = this.x().multiply(p2.z())
    const z1z2 = this.z().multiply(p2.z())
    const u = p2.y().multiply(this.z()).subtract(y1z2)
    const uu = u.multiply(u)
    const v = p2.x().multiply(this.z()).subtract(x1z2)
    const vv = v.multiply(v)
    const vvv = vv.multiply(v)
    const R = vv.multiply(x1z2)
    const A = uu.multiply(z1z2).subtract(vvv).subtract(R.add(R))
    const X3 = v.multiply(A)
    const Y3 = u.multiply(R.subtract(A)).subtract(vvv.multiply(y1z2))
    const Z3 = vvv.multiply(z1z2)

    const p3: Group<T> = new Group<T>()
    p3._x = X3
    p3._y = Y3
    p3._z = Z3

    return p3
  }

  _double(b: T, zero: T, one: T): Group<T> {
    if (this.isInfinity(zero, one)) {
      return this.clone()
    }
    const XX = this.x().multiply(this.x())
    const ZZ = this.z().multiply(this.z())
    const w = XX.add(XX).add(XX)
    const y1z1 = this.y().multiply(this.z())
    const s = y1z1.add(y1z1)
    const ss = s.multiply(s)
    const sss = ss.multiply(s)
    const R = this.y().multiply(s)
    const RR = R.multiply(R)
    const X1R = this.x().add(R)
    const B = X1R.multiply(X1R).subtract(XX).subtract(RR)
    const h = w.multiply(w).subtract(B).subtract(B)
    const X3 = h.multiply(s)
    const Y3 = w.multiply(B.subtract(h)).subtract(RR).subtract(RR)
    const Z3 = sss

    const p3: Group<T> = new Group<T>()
    p3._x = X3
    p3._y = Y3
    p3._z = Z3

    return p3
  }

  _scalarMult(b: T, infinity: Group<T>, zero: T, one: T, s: bigInt.BigInteger): Group<T> {
    let scopy = bigInt(s)
    let bits: boolean[] = [];
    const bone = bigInt(1)
    const bitLength = s.bitLength().toJSNumber()
    for (let i = 0; i < bitLength; i++) {
      bits.unshift(scopy.and(bone).equals(bone))
      scopy = scopy.shiftRight(1)
    }

    let sum = infinity
    for (let i = 0; i < bitLength; i++) {
      sum = sum._double(b, zero, one)
      if (bits[i]) {
        sum = sum._add(b, zero, one, this)
      }
    }

    return sum
  }

  toAffine(): Group<T> {
    const p: Group<T> = new Group<T>()
    const zinv = this.z().inverse()
    p._x = this.x().multiply(zinv)
    p._y = this.y().multiply(zinv)
    p._z = this.z().multiply(zinv)

    return p
  }

  equals(p2: Group<T>): boolean {
    const pAffine = this.toAffine()
    const p2Affine = p2.toAffine()
    return (pAffine.x().equals(p2Affine.x()) && pAffine.y().equals(p2Affine.y()))
  }

  equalsProjective(p2: Group<T>): boolean {
    return (this.x().equals(p2.x()) && this.y().equals(p2.y()) && this.z().equals(p2.z()))
  }

  isInfinity(zero: T, one: T): boolean {
    return (this.x().equals(zero) && this.y().equals(one) && this.z().equals(zero))
  }

  clone(): Group<T> {
    const p: Group<T> = new Group<T>()
    p._x = this.x()
    p._y = this.y()
    p._z = this.z()

    return p
  }

  toString(base?: number): string {
    return `G(${this.x().toString(base)}, ${this.y().toString(base)}, ${this.z().toString(base)})`
  }
}
