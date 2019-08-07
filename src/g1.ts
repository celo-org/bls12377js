import F from './f'
import Group from './group'
import * as bigInt from 'big-integer'
import { Defs, GroupSpec } from './defs'

export default class G1 implements GroupSpec<F, G1> {
  private g: Group<F>
  private zero: F
  private one: F

  private static b(): F {
    return F.fromBig(Defs.b)
  }

  static fromElements(x: F, y: F): G1 {
    const elem = new G1()
    elem.g = Group.fromElements<F>(G1.b(), F.zero(), F.one(), x, y, F.one())
    return elem
  }

  add(p2: G1): G1 {
    const elem = this.g._add(G1.b(), F.zero(), F.one(), p2.g)
    const p = new G1()
    p.g = elem
    return p
  }

  dbl(): G1 {
    const elem = this.g._double(G1.b(), F.zero(), F.one())
    const p = new G1()
    p.g = elem
    return p
  }

  scalarMult(s: bigInt.BigInteger): G1 {
    const infinity = Group.fromElements<F>(G1.b(), F.zero(), F.one(), F.zero(), F.one(), F.zero())
    const elem = this.g._scalarMult(G1.b(), infinity, F.zero(), F.one(), s)
    const p = new G1()
    p.g = elem
    return p
  }

  equals(p2: G1): boolean {
    return this.g.equals(p2.g)
  }

  toAffine(): G1 {
    const p = new G1()
    p.g = this.g.toAffine()
    return p
  }

  x(): F {
    return this.g.x()
  }

  y(): F {
    return this.g.y()
  }

  z(): F {
    return this.g.z()
  }

  toString(base?: number): string {
    return this.g.toString(base)
  }
}
