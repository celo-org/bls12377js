import { Defs } from './defs'
import * as bigInt from 'big-integer'
import * as reverse from 'buffer-reverse'
import F from './f'
import F2 from './f2'
import G1 from './g1'
import G2 from './g2'

import * as BLAKE2sImport from 'blake2s-js'
const BLAKE2s: any = BLAKE2sImport

export function bufferToArray(buf: Buffer): number[] {
  return buf.toJSON().data
}

export function arrayToBuffer(arr: number[]): Buffer {
  return new Buffer(arr)
}

export function bufferToBig(buf: Buffer): bigInt.BigInteger {
  const arr = bufferToArray(reverse(buf))
  return bigInt.fromArray(arr, 256)
}

export function bigToBuffer(num: bigInt.BigInteger): Buffer {
  const arr: number[] = num.toArray(256).value
  return reverse(arrayToBuffer(arr))
}

export function getMiddlePoint(): bigInt.BigInteger {
  const modulus = bigInt(Defs.modulus)
  return modulus.subtract(1).over(2)
}

export function compressG1(g: G1): Buffer {
  const gAffine = g.toAffine()
  let x = padBytes(bigToBuffer(gAffine.x().toBig()), Defs.fByteSize)
  const y = gAffine.y().toBig()
  if (y.compare(getMiddlePoint()) > 0) {
    x[x.length - 1] |= 0x80
  }
  return x
}

export function compressG2(g: G2): Buffer {
  const gAffine = g.toAffine()
  const x = gAffine.x().toFs()
  const x0 = padBytes(bigToBuffer(x[0].toBig()), Defs.fByteSize)
  const x1 = padBytes(bigToBuffer(x[1].toBig()), Defs.fByteSize)
  const y = gAffine.y().toFs()
  const y0 = y[0].toBig()
  const y1 = y[1].toBig()

  let xBytes = Buffer.concat([x0, x1])
  if (y1.compare(getMiddlePoint()) > 0) {
    xBytes[xBytes.length - 1] |= 0x80
  } else if (
    (y1.compare(getMiddlePoint()) == 0) &&
    (y0.compare(getMiddlePoint()) > 0)
  ) {
    xBytes[xBytes.length - 1] |= 0x80
  }
  return xBytes
}

export function g1Generator(): G1 {
  return G1.fromElements(
    F.fromBig(Defs.g1Generator[0]),
    F.fromBig(Defs.g1Generator[1]),
  )
}

export function g2Generator(): G2 {
  return G2.fromElements(
    F2.fromElements(
      F.fromBig(Defs.g2Generator[0][0]),
      F.fromBig(Defs.g2Generator[0][1]),
    ),
    F2.fromElements(
      F.fromBig(Defs.g2Generator[1][0]),
      F.fromBig(Defs.g2Generator[1][1]),
    ),
  )
}

export function padBytes(buf: Buffer, expectedLength: number): Buffer {
  let result = new Buffer(buf)
  while (result.length < expectedLength) {
    result = Buffer.concat([
      result,
      new Buffer(1),
    ])
  }
  return result
}

export function privateToPublicBytes(privateKey: Buffer): Buffer {
  const privateKeyBig = bufferToBig(privateKey)
  const publicKeyBytes = compressG1(g1Generator().scalarMult(privateKeyBig))
  return publicKeyBytes
}

export function signPoP(privateKey: Buffer): Buffer {
  const privateKeyBig = bufferToBig(privateKey)
  const publicKeyBytes = privateToPublicBytes(privateKey)
  const messagePoint = tryAndIncrement(
    new Buffer('096b36a5804bfacef1691e173c366a47ff5ba84a44f26ddd7e8d9f79d5b42df0'),
    new Buffer('ULforpop'),
    publicKeyBytes,
  )
  const signedMessage = messagePoint.scalarMult(privateKeyBig)
  const scalingFactor = Defs.blsX.multiply(Defs.blsX).subtract(bigInt(1)).multiply(3).multiply(Defs.g2Cofactor)
  const signedMessageScaled = signedMessage.scalarMult(scalingFactor)
  const signatureBytes = compressG2(signedMessageScaled)
  return signatureBytes
}

export function crh(message: Buffer): Buffer {
  return Buffer.from(
    (new BLAKE2s(32))
    .update(message)
    .digest()
  )
  return new Buffer(0)
}

export function prf(key: Buffer, domain: Buffer, messageHash: Buffer): Buffer {
  let result = new Buffer(0)
  for (let i = 0; i < 3; i++) {
    const counter = new Buffer(1)
    counter[0] = i
    const buf = Buffer.concat([
      key,
      counter,
      messageHash,
    ])
    const hash = Buffer.from(
      (new BLAKE2s(32, { personalization: domain }))
      .update(buf)
      .digest()
    )
    result = Buffer.concat([result, hash])
  }
  return result
}

export function tryAndIncrement(key: Buffer, domain: Buffer, message: Buffer): G2 {
  const messageHash = crh(message)
  for (let i = 0; i < 256; i++) {
    const counter = new Buffer(1)
    counter[0] = i
    const hash = prf(key, domain, Buffer.concat([
      counter,
      messageHash,
    ]))
    const possibleX0Bytes = hash.slice(0, hash.length/2)
    possibleX0Bytes[possibleX0Bytes.length - 1] &= 1
    const possibleX0Big = bufferToBig(possibleX0Bytes);
    let possibleX0
    try {
      possibleX0 = F.fromBig(possibleX0Big)
    } catch(e) {
      continue
    }
    const possibleX1Bytes = hash.slice(hash.length/2, hash.length)
    possibleX1Bytes[possibleX1Bytes.length - 1] &= 1
    const possibleX1Big = bufferToBig(possibleX1Bytes);
    let possibleX1
    try {
      possibleX1 = F.fromBig(possibleX1Big)
    } catch(e) {
      continue
    }

    const possibleX = F2.fromElements(
      possibleX0,
      possibleX1,
    )
    let y
    try {
      y = (possibleX.multiply(possibleX).multiply(possibleX).add(F2.fromElements(
        F.fromBig(Defs.bTwist[0]),
        F.fromBig(Defs.bTwist[1]),
      ))).sqrt()
      const negy = y.negate().toFs()

      const negy0 = negy[0].toBig()
      const negy1 = negy[1].toBig()
      if (negy1.compare(getMiddlePoint()) > 0) {
        y = y.negate()
      } else if (
        (negy1.compare(getMiddlePoint()) == 0) &&
        (negy0.compare(getMiddlePoint()) > 0)
      ) {
        y = y.negate()
      }
    } catch(e) {
      continue
    }

    return G2.fromElements(
      possibleX,
      y
    )
  }

  throw new Error('couldn\'t sign pop')
}
