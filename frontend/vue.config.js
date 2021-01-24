const fs = require("fs");
const incstr = require("incstr");
const nextId = incstr.idGenerator();

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
    outputDir: "/var/www/webchat/",
    css: {
        requireModuleExtension: true,
        loaderOptions: {
            css: {
                modules: {
                    getLocalIdent: (context, localIdentName, localName, options) =>
                    {
                        return nextId();
                    }
                }
            }
        }
      }
};