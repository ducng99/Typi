import { expect } from 'chai'
import CryptoTools from '../../src/encryption/CryptoTools'
import { createHash } from 'crypto'

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
})
