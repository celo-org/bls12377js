import F from './f'
import F2 from './f2'
import Group from './group'
import * as bigInt from 'big-integer'
import { Defs, GroupSpec } from './defs'

export default class G2 implements GroupSpec<F2, G2> {
  private g: Group<F2>

  private static b(): F2 {
    return F2.fromElements(
      F.fromBig(Defs.bTwist[0]),
      F.fromBig(Defs.bTwist[1]),
    )
  }

  static fromElements(x: F2, y: F2): G2 {
    const elem = new G2()
    elem.g = Group.fromElements<F2>(G2.b(), F2.zero(), F2.one(), x, y, F2.one())
    return elem
  }

  add(p2: G2): G2 {
    const elem = this.g._add(G2.b(), F2.zero(), F2.one(), p2.g)
    const p = new G2()
    p.g = elem
    return p
  }

  dbl(): G2 {
    const elem = this.g._double(G2.b(), F2.zero(), F2.one())
    const p = new G2()
    p.g = elem
    return p
  }

  scalarMult(s: bigInt.BigInteger): G2 {
    const infinity = Group.fromElements<F2>(G2.b(), F2.zero(), F2.one(), F2.zero(), F2.one(), F2.zero())
    const elem = this.g._scalarMult(G2.b(), infinity, F2.zero(), F2.one(), s)
    const p = new G2()
    p.g = elem
    return p
  }

  negate(): G2 {
    const affineThis = this.toAffine()
    return G2.fromElements(
      affineThis.x(),
      affineThis.y().negate(),
    )
  }

  equals(p2: G2): boolean {
    return this.g.equals(p2.g)
  }

  toAffine(): G2 {
    const p = new G2()
    p.g = this.g.toAffine()
    return p
  }

  x(): F2 {
    return this.g.x()
  }

  y(): F2 {
    return this.g.y()
  }

  z(): F2 {
    return this.g.z()
  }

  toString(base?: number): string {
    return this.g.toString(base)
  }
}
