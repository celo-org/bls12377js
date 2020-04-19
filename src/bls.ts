import { Defs } from './defs'
import bigInt = require('big-integer')
import F from './f'
import F2 from './f2'
import G1 from './g1'
import G2 from './g2'

import { BLAKE2Xs } from '@stablelib/blake2xs'

export function reverse(src: Buffer) {
  const buffer = new Buffer(src.length)

  for (let i = 0, j = src.length - 1; i <= j; ++i, --j) {
    buffer[i] = src[j]
    buffer[j] = src[i]
  }

  return buffer
}

export function uint8ArrayToBuffer(src: Uint8Array): Buffer {
  const buffer = new Buffer(src.length)
  for (let i = 0; i < src.length; i++) {
    buffer[i] = src[i]
  }

  return buffer
}

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

export function decompressG1(bytes: Buffer): G1 {
  const possibleXBytes = bytes
  const greatest = (possibleXBytes[possibleXBytes.length - 1] & 0x80) == 0x80
  possibleXBytes[possibleXBytes.length - 1] &= 1
  const possibleXBig = bufferToBig(possibleXBytes)
  let possibleX = F.fromBig(possibleXBig)

  let y = (possibleX.multiply(possibleX).multiply(possibleX).add(F.fromBig(bigInt(1)))).sqrt()
  const negy = y.negate().toBig()

  let negyIsGreatest = false
  if (negy.compare(getMiddlePoint()) > 0) {
    negyIsGreatest = true
  }
  if (negyIsGreatest && greatest) {
    y = y.negate()
  }
  if (!negyIsGreatest && !greatest) {
    y = y.negate()
  }

  return G1.fromElements(
    possibleX,
    y,
  )
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
    (y1.compare(y0) == 0) &&
    (y0.compare(getMiddlePoint()) > 0)
  ) {
    xBytes[xBytes.length - 1] |= 0x80
  }
  return xBytes
}

export function decompressG2(bytes: Buffer): G2 {
  const possibleX0Bytes = bytes.slice(0, bytes.length/2)
	possibleX0Bytes[possibleX0Bytes.length - 1] &= 1
  const possibleX0Big = bufferToBig(possibleX0Bytes)
  let possibleX0 = F.fromBig(possibleX0Big)
  const possibleX1Bytes = bytes.slice(bytes.length/2, bytes.length)
  const greatest = (possibleX1Bytes[possibleX1Bytes.length - 1] & 0x80) == 0x80
  possibleX1Bytes[possibleX1Bytes.length - 1] &= 1
  const possibleX1Big = bufferToBig(possibleX1Bytes)
  let possibleX1 = F.fromBig(possibleX1Big)
  const possibleX = F2.fromElements(
    possibleX0,
    possibleX1,
  )
  let y = (possibleX.multiply(possibleX).multiply(possibleX).add(F2.fromElements(
    F.fromBig(Defs.bTwist[0]),
    F.fromBig(Defs.bTwist[1]),
  ))).sqrt()
  const negy = y.negate().toFs()

  const negy0 = negy[0].toBig()
  const negy1 = negy[1].toBig()

  let negyIsGreatest = false
  if (negy1.compare(getMiddlePoint()) > 0) {
    negyIsGreatest = true
  } else if (
    (negy1.compare(getMiddlePoint()) == 0) &&
    (negy0.compare(getMiddlePoint()) > 0)
  ) {
    negyIsGreatest = true
  }
  if (negyIsGreatest && greatest) {
    y = y.negate()
  }
  if (!negyIsGreatest && !greatest) {
    y = y.negate()
  }
  return G2.fromElements(
    possibleX,
    y
  )
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
  const publicKeyBytes = compressG2(g2Generator().scalarMult(privateKeyBig))
  return publicKeyBytes
}

export function signPoP(privateKey: Buffer, address: Buffer): Buffer {
  const privateKeyBig = bufferToBig(privateKey)
  const messagePoint = tryAndIncrement(
    new Buffer('ULforpop'),
    address,
  )
  const signedMessage = messagePoint.scalarMult(privateKeyBig)
  const signedMessageScaled = signedMessage.scalarMult(Defs.g1Cofactor)
  const signatureBytes = compressG1(signedMessageScaled)
  return signatureBytes
}

export function tryAndIncrement(domain: Buffer, message: Buffer): G1 {
  const xofDigestLength = 512/8
  for (let i = 0; i < 256; i++) {
    const counter = new Buffer(1)
    counter[0] = i
    const messageWithCounter = Buffer.concat([
      counter,
      message,
    ])
    const hash = uint8ArrayToBuffer((new BLAKE2Xs(xofDigestLength, { personalization: domain })).update(messageWithCounter).digest())
    const possibleXBytes = hash.slice(0, 384/8)
    const greatest = (possibleXBytes[possibleXBytes.length - 1] & 0x80) == 0x80
    possibleXBytes[possibleXBytes.length - 1] &= 1
    const possibleXBig = bufferToBig(possibleXBytes)
    let possibleX
    try {
      possibleX = F.fromBig(possibleXBig)
    } catch(e) {
      continue
    }

    let y
    try {
      y = (possibleX.multiply(possibleX).multiply(possibleX).add(F.fromBig(bigInt(1)))).sqrt()
      const negy = y.negate().toBig()

      let negyIsGreatest = false
      if (negy.compare(getMiddlePoint()) > 0) {
        negyIsGreatest = true
      }
      if (negyIsGreatest && greatest) {
        y = y.negate()
      }
      if (!negyIsGreatest && !greatest) {
        y = y.negate()
      }
    } catch(e) {
      continue
    }

    return G1.fromElements(
      possibleX,
      y
    )
  }

  throw new Error('couldn\'t sign pop')
}
