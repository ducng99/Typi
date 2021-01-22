# Typi :speech_balloon: - a simple End-to-End Encryption web chat (W.I.P)
Fun project, ~~nothing else.~~

<html>
<b>Typi</b> 💬 is a simple web chat project features End-to-End Encryption (using hybrid encryption).<br/><br/>
When you register, a <b class="text-danger">private key</b> 🔑 and a <b class="text-success">public key</b> 🔑 will be generated using your browser (RSA-1024). Only your <b class="text-success">public key</b> 🔑 will be uploaded to our server for encryption and your <b class="text-danger">private key</b> 🔑 will be stored in <b>local storage</b> in your browser.<br/>
Whenever you receive a message, your browser will decrypt an <b class="text-info">AES key</b> using your <b class="text-danger">private key</b> 🔑, decrypt the message with that <b class="text-info">AES key</b> and then display it to you.<br/>
And vice versa, the message you sent will be encrypted using a randomly generated <b class="text-info">AES key</b>, that key will be encrypted using the receiver's <b class="text-success">public key</b>🔑 and the encrypted message with encrypted key will be saved on our server.<br/><br/>
This way, neither us or your ISP can see the messages you send or receive.<br/><br/>
We also use a cookie 🍪 to store your session ID. It expires after you close your browser or inactive for more than 15 minutes.<br/>
You can clear your cookies 🍪 and <b class="text-danger">private key</b> 🔑 using the buttons above.
</html>

Created using Vue.js, Bootstrap(-Vue), Express.js and MySQL, and other plugins.<br/>
*:+1: And thanks to Stack Overflow members.*
