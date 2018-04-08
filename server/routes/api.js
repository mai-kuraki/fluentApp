let express = require('express');
let router = express.Router();
let service = require('./service');
/**
 * 获取最新歌曲
 */
router.get('/personalized/newsong', (req, res) => {
    service.newsong(req, res);
});
/**
 * 获取推荐歌单
 */
router.get('/personalized', (req, res) => {
   service.personalized(req, res);
});
/**
 * 获取热门专辑
 */
router.get('/top/album', (req, res) => {
    service.topAlbum(req, res);
});
/**
 * 获取专辑内容
 */
router.get('/album', (req, res) => {
    service.getAlbum(req, res);
});
/**
 * 获取歌单详情
 */
router.get('/playlist/detail', (req, res) => {
    service.playlistDetail(req, res);
});
/**
 * 根据id获取音乐url
 */
router.get('/music/url', (req, res) => {
    service.musicUrl(req, res);
});
/**
 * 获取音乐信息
 */
router.get('/song/detail', (req, res) => {
    service.songDetail(req, res);
});
/**
 * 搜索
 */
router.get('/search', (req, res) => {
    service.search(req, res);
});
module.exports = router;