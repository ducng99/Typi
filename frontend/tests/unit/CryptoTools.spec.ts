import { expect } from 'chai'
import CryptoTools from '@/encryption/CryptoTools'
import { createHash } from 'crypto'

const secretKey = createHash("sha256").update("some secret stuff").digest('hex');
const wrongSecretKey = createHash("sha256").update("something else").digest('hex');
const toEncryptText = "p4ssw0rd";
const salt = 'a simple salt'
const argon2idHashed = '';

describe('CryptoTools.ts', function() {
    this.timeout(1000);
    
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
            expect(aliceKeys).to.not.be.false;
            if (aliceKeys)
            {
                expect(aliceKeys.getPrivateKey()).to.not.be.empty;
                expect(aliceKeys.getPublicKey()).to.not.be.empty;
                
                CryptoTools.GenerateDHKeys().then(bobKeys => {
                    expect(bobKeys).to.not.be.false;
                    if (bobKeys)
                    {
                        expect(bobKeys.getPrivateKey()).to.not.be.empty;
                        expect(bobKeys.getPublicKey()).to.not.be.empty;
                        
                        CryptoTools.GetSharedSecret(aliceKeys.getPrivateKey().toString('hex'), bobKeys.getPublicKey().toString('hex'))
                        .then(aliceSharedSecret => {
                            expect(aliceSharedSecret).to.not.be.false;
                            
                            CryptoTools.GetSharedSecret(bobKeys.getPrivateKey().toString('hex'), aliceKeys.getPublicKey().toString('hex'))
                            .then(bobSharedSecret => {
                                expect(bobSharedSecret).to.not.be.false;
                                
                                expect(aliceSharedSecret.toString('hex')).to.equal(bobSharedSecret.toString('hex'));
                                
                                done();
                            })
                        })
                    }
                })
            }
        })
    })
    
    it('Argon2id hash test', (done) => {
        CryptoTools.HashString(toEncryptText, salt)
        .then(result => {
            expect(result).to.not.be.false;
            expect(result).to.equal(argon2idHashed);
            done();
        })
    })
})
