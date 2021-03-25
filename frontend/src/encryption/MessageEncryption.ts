import crypto, { DiffieHellman } from 'crypto'
import CryptoTools from './CryptoTools'

export default {
    /**
     * Get shared secret from our key pair and receiver's public key
     * @param {DiffieHellman} DHKeypair DiffieHellman object containing private key
     * @param {String} ReceiverPublicKey receiver public key in hex
     * @returns {Buffer} a buffer containing the shared secret key
     */
    GetSharedSecret(DHKeypair: DiffieHellman, ReceiverPublicKey: string): Buffer
    {
        return DHKeypair.computeSecret(ReceiverPublicKey, 'hex');
    }
}