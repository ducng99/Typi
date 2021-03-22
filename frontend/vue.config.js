const fs = require("fs");
const incstr = require("incstr");
const nextId = incstr.idGenerator();
var savedCssNames = {};
var sslPath = "/home/tom/ssl_keys/";

module.exports = {
    devServer: {
        port: 2053,
        disableHostCheck: true,
        https: {
            key: fs.existsSync(sslPath + 'privkey.pem') ? fs.readFileSync(sslPath + 'privkey.pem') : "",
            cert: fs.existsSync(sslPath + 'cert.pem') ? fs.readFileSync(sslPath + 'cert.pem') : "",
            ca: fs.existsSync(sslPath + 'chain.pem') ? fs.readFileSync(sslPath + 'chain.pem') : "",
        }
    },
    outputDir: fs.existsSync("/var/www/typi/") ? "/var/www/typi/" : "dist",
    css: {
        requireModuleExtension: true,
        loaderOptions: {
            css: {
                modules: {
                    getLocalIdent: (context, localIdentName, localName, options) =>
                    {
                        if (localName in savedCssNames)
                        {
                            return savedCssNames[localName];
                        }
                        
                        let name = nextId();
                        savedCssNames[localName] = name;
                        return name;
                    }
                }
            }
        }
    },
    configureWebpack: {
        module: {
            noParse: /\.wasm$/,
            rules: [
                {
                    test: /\.wasm$/,
                    loader: 'base64-loader',
                    type: 'javascript/auto',
                },
            ],
        }
    }
};