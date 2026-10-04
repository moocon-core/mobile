import { install } from 'react-native-quick-crypto'
import { Buffer } from 'buffer'

install()

// Hermes ignores Symbol.species, so Buffer#subarray yields a bare Uint8Array and Anchor's borsh decode loses readUIntLE.
for (const B of new Set([Buffer, global.Buffer])) {
  B.prototype.subarray = function subarray(begin, end) {
    return Object.setPrototypeOf(Uint8Array.prototype.subarray.call(this, begin, end), B.prototype)
  }
}
