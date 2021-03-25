import { expect } from 'chai'
import CryptoTools from '../../src/encryption/CryptoTools'
import { createHash, createDiffieHellman } from 'crypto'

const secretKey = createHash("sha256").update("some secret stuff").digest('hex');
const wrongSecretKey = createHash("sha256").update("something else").digest('hex');
const toEncryptText = "p4ssw0rd";

describe('CryptoTools.ts', () => {    
    it('Encrypt and decrypt with AES', (done) => {
        CryptoTools.EncryptAESWithKey(toEncryptText, secretKey).then(encrypted => {
            expect(encrypted).to.not.be.false;
            
            if (encrypted)
            {
                CryptoTools.DecryptAESWithKey(encrypted.message, secretKey, encrypted.iv, encrypted.authTag).then(decrypted => {
                    expect(decrypted).to.not.be.false;
                    
                    if (decrypted)
                    {
                        expect(decrypted).to.equal(toEncryptText);
                        done();
                    }
                })
            }
        })
    })
    
    it('Encrypt and decrypt with AES (with wrong secret)', (done) => {
        CryptoTools.EncryptAESWithKey(toEncryptText, secretKey).then(encrypted => {
            expect(encrypted).to.not.be.false;
            
            if (encrypted)
            {
                CryptoTools.DecryptAESWithKey(encrypted.message, wrongSecretKey, encrypted.iv, encrypted.authTag).then(decrypted => {
                    expect(decrypted).to.be.false;
                    done();
                })
            }
        })
    })
    
    it('Get shared secret', (done) => {
        CryptoTools.GenerateDHKeys().then(aliceKeys => {
            expect(aliceKeys.getPrivateKey()).to.not.be.empty;
            expect(aliceKeys.getPublicKey()).to.not.be.empty;
            
            CryptoTools.GenerateDHKeys().then(bobKeys => {
                expect(bobKeys.getPrivateKey()).to.not.be.empty;
                expect(bobKeys.getPublicKey()).to.not.be.empty;
                
                const aliceSharedSecret = CryptoTools.GetSharedSecret(aliceKeys, bobKeys.getPublicKey().toString('hex'));
                const bobSharedSecret = CryptoTools.GetSharedSecret(bobKeys, aliceKeys.getPublicKey().toString('hex'));
                
                expect(aliceSharedSecret.toString('hex')).to.equal(bobSharedSecret.toString('hex'));
                
                done();
            })
        })
    })
})
