const fs = require("fs");

module.exports = {
    devServer: {
        public: "ducng.dev:2053",
        port: 2053,
        disableHostCheck: true,
        https: {
            key: fs.readFileSync('/home/tom/ssl_keys/privkey.pem'),
            cert: fs.readFileSync('/home/tom/ssl_keys/cert.pem'),
            ca: fs.readFileSync('/home/tom/ssl_keys/chain.pem'),
        }
    },
    outputDir: "/var/www/webchat/"
};