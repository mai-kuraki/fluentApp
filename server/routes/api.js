let express = require('express');
let router = express.Router();
let service = require('./service');

router.get('/search', (req, res, next) => {
    service.search(req, res);
});

router.get('/music/url', (req, res, next) => {
    service.musicUrl(req, res);
});

router.get('/song/detail', (req, res, next) => {
    service.songDetail(req, res);
});

module.exports = router;