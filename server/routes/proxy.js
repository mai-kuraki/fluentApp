let express = require('express');
let router = express.Router();
let http = require('http');
let https = require('https');
let httpProxy = require('http-proxy');
let url = require('url');

router.use('*', (req, res) => {
    req.url = req.originalUrl.replace('/proxy', '');
    let proxy = httpProxy.createProxy({});
    proxy.on('error', (err) => {
        console.log('ERROR');
        console.log(err);
    });
    let finalUrl = 'http://m10.music.126.net';
    let finalAgent = null;
    let parsedUrl = url.parse(finalUrl);
    if (parsedUrl.protocol === 'https:') {
        finalAgent = https.globalAgent;
    } else {
        finalAgent = http.globalAgent;
    }
    proxy.web(req, res, {
        target: finalUrl,
        agent: finalAgent,
        headers: { host: parsedUrl.hostname },
        prependPath: false,
        xfwd : true,
        hostRewrite: finalUrl.host,
        protocolRewrite: parsedUrl.protocol
    });
});

module.exports = router;
