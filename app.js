var express = require('express');
var proxy = require('express-http-proxy');
var url = require('url');
var acceptLanguage = require('accept-language');
var cookieParser = require('cookie-parser');

var app = express();
var DEFAULT_LANG = 'en';

app.use(cookieParser());

app.use(function (req, res, next) {
    var acceptLang = acceptLanguage.get(req.get('Accept-Language') || 'en'),
        lang = req.cookies['lang'] || acceptLang.slice(0, 2) || DEFAULT_LANG,
        isEnglish = req.url.startsWith('/en'),
        isRussian = req.url.startsWith('/ru');

    if (isEnglish || isRussian) {
        lang = isRussian ? 'ru' : 'en';
        res.cookie('lang', lang);
    } else {
        req.url = '/' + lang + req.url;
        if (req.url.endsWith('/')) {
            res.cookie('lang', lang);
        }
    }

    next();
});

app.use('/en', proxy('0.0.0.0:3000', {
    forwardPath: function (req, res) {
        return url.parse(req.url).path;
    }
}));

app.use('/ru', proxy('0.0.0.0:3001', {
    forwardPath: function (req, res) {
        return url.parse(req.url).path;
    }
}));

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
