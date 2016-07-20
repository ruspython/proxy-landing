var express = require('express');
var proxy = require('express-http-proxy');
var url = require('url');
var acceptLanguage = require('accept-language');
var cookieParser = require('cookie-parser');

var app = express();
var DEFAULT_LANG = 'en';

var currentLang = DEFAULT_LANG;

app.use(cookieParser());

app.use(function (req, res, next) {
    var acceptLang = acceptLanguage.get(req.get('Accept-Language') || 'en'),
        lang = req.cookies['locale'] || acceptLang.slice(0, 2) || DEFAULT_LANG,
        isEnglish = req.url.startsWith('/en'),
        isRussian = req.url.startsWith('/ru') || (lang.search('ru'));

    if (!lang) {
      lang = isRussian ? 'ru' : 'en';
    }

    res.cookie('locale', lang);
    currentLang = lang;
    console.log("lang: %s", currentLang);
    next();
});

app.use('/en', proxy('0.0.0.0:3000', {
    forwardPath: function (req, res) {
        return url.parse(req.url).path;
    },
    limit: '10mb'
}));

app.use('/ru', proxy('0.0.0.0:3001', {
    forwardPath: function (req, res) {
        return url.parse(req.url).path;
    },
    limit: '10mb'
}));

app.use('/', function(req, res) {
    var langUrl = '/' + currentLang + req.url;
    req.url = langUrl;
    res.status(303).redirect(langUrl);
});

app.listen(7000, function () {
    console.log('Running app on port 7000');
});

module.exports = app;
