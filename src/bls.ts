import { Defs } from './defs'
import * as bigInt from 'big-integer'
import F from './f'
import F2 from './f2'
import G1 from './g1'
import G2 from './g2'

export function bufferToArray(buf: Buffer): number[] {
  return buf.toJSON().data
}

export function arrayToBuffer(arr: number[]): Buffer {
  return new Buffer(arr)
}

export function bufferToBig(buf: Buffer): bigInt.BigInteger {
  const arr = bufferToArray(buf)
  return bigInt.fromArray(arr, 256)
}

export function bigToBuffer(num: bigInt.BigInteger): Buffer {
  const arr: number[] = num.toArray(256).value
  return arrayToBuffer(arr)
}

export function prf(key: Buffer, domain: Buffer, message: Buffer) {

}
