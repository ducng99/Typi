# Typi :speech_balloon: - a simple End-to-End Encryption web chat (W.I.P)
Fun project, ~~nothing else.~~

## What is this?
<b>Typi</b> 💬 is a simple web chat project features End-to-End Encryption (using hybrid encryption).<br/><br/>
When you register, a <b style="color: #dc3545">private key</b> 🔑 and a <b style="color: #28a745">public key</b> 🔑 will be generated using your browser (RSA-1024). Only your <b style="color: #28a745">public key</b> 🔑 will be uploaded to our server for encryption and your <b style="color: #dc3545">private key</b> 🔑 will be stored in <b>local storage</b> in your browser.<br/>
Whenever you receive a message, your browser will decrypt an <b style="color: #17a2b8">AES key</b> using your <b style="color: #dc3545">private key</b> 🔑, decrypt the message with that <b style="color: #17a2b8">AES key</b> and then display it to you.<br/>
And vice versa, the message you sent will be encrypted using a randomly generated <b style="color: #17a2b8">AES key</b>, that key will be encrypted using the receiver's <b style="color: #28a745">public key</b>🔑 and the encrypted message with encrypted key will be saved on our server.<br/>

This way, neither us or your ISP can see the messages you send or receive.<br/>

We also use a cookie 🍪 to store your session ID. It expires after you close your browser or inactive for more than 15 minutes.<br/>

## Credits
Created using Vue.js, Bootstrap(-Vue), Express.js and MySQL, and other plugins.<br/>
*:+1: And thanks to Stack Overflow members.*
