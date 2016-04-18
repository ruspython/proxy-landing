var express = require('express');
var proxy = require('express-http-proxy');
var url = require('url');
var acceptLanguage = require('accept-language');
var cookieParser = require('cookie-parser');

var app = express();
var DEFAULT_LANG = 'en';

app.use(cookieParser());

app.use(function (req, res, next) {
    var acceptLang = acceptLanguage.get(req.get('Accept-Language')),
        lang = req.cookies['lang'] || acceptLang.slice(0, 2) || DEFAULT_LANG,
        isEnglish = ~req.url.indexOf('en'),
        isRussian = ~req.url.indexOf('ru');

    if (!isEnglish && !isRussian) {
        req.url = '/' + lang + req.url;
        res.cookie('lang', lang);
    }

    next();
});

app.use('/en', [
    function (req, res, next) {
        res.cookie('lang', 'en');
        next();
    }, proxy('0.0.0.0:3000', {
        forwardPath: function (req, res) {
            return url.parse(req.url).path;
        }
    })
]);

app.use('/ru', [
    function (req, res, next) {
        res.cookie('lang', 'ru');
        next();
    }, proxy('0.0.0.0:3001', {
        forwardPath: function (req, res) {
            return url.parse(req.url).path;
        }
    })
]);

//app.use(express.static(__dirname + '/../soshace-landing-keystone/dist'));

//app.use('/images', proxy('0.0.0.0:3001/images', {
//    forwardPath: function(req, res) {
//        return url.parse(req.url).path;
//    }
//}));
//
//app.use('/css', proxy('0.0.0.0:3001/css', {
//    forwardPath: function(req, res) {
//        return url.parse(req.url).path;
//    }
//}));
//
//app.use('/js', proxy('0.0.0.0:3001/js', {
//    forwardPath: function(req, res) {
//        return url.parse(req.url).path;
//    }
//}));

//app.use('/', function (req, res, next) {
//    var lang = acceptLanguage.get(req.headers["accept-language"]);
//    if (lang.indexOf('ru') >= 0) {
//        //console.log(arguments)
//    } else {
//
//    }
//});

app.listen(7000, function () {
    console.log('Running app on port 7000');
});

module.exports = app;
