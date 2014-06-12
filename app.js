/**
 * Module dependencies.
 */
 
var express = require('express')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
  , http = require('http')
  , path = require('path')
;

var app = express();
 
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
});
 
app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/kyoutube', function(req, res){

  if(req.query.search_query == undefined || req.query.search_query == '') {
    var fullDate = new Date()
    var month = fullDate.getMonth() + 1;
    var hours = fullDate.getHours();
    var days = '';
    if (hours > 18) {
      days =  fullDate.getDate()-1;
    } else {
      days =  fullDate.getDate(); 
    }
    var currentDateno =  fullDate.getFullYear() + '' + month + '' + days;
    req.query.search_query = currentDateno;
  }
  if(req.query.filters == undefined || req.query.filters == '') {
    req.query.filters = 'today';
  }

  //Tell the request that we want to fetch youtube.com, send the results to a callback function
  request({uri: 'http://www.youtube.com/results?search_query='+req.query.search_query+'&filters='+req.query.filters+'&lclk='+req.query.filters}, function(err, response, body){
//  request({uri: 'http://www.youtube.com/results?search_query=akb'}, function(err, response, body){  
    var self = this;
    self.items = new Array();//I feel like I want to save my results in an array
 
    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    jsdom.env({
      html: body,
      scripts: ['http://code.jquery.com/jquery-1.10.2.min.js'],
      done: function(err, window){
      //Use jQuery just as in a regular HTML page
      var $ = window.jQuery;

      $body = $('body'),
      //$videos = $body.find('ol.context-data-container li');
//$videos = $body.find('ol.context-data-container li.context-data-item');
      //$videos = $body.find('.context-data-item');
$videos = $body.find('li.yt-lockup');
console.log($videos.size());
      $videos.each(function(i, item) {
        var $item = $(item);
        //var $title = $item.attr('yt-uix-sessionlink');
        var $title = $item.find('h3.yt-lockup-title a').attr('title');
        var $description = $item.find('a');
        var $a = $description.attr('href');    
        var $time =  $item.attr('data-context-item-time');
        var $img = $item.find('span.yt-thumb-clip img');         
        var $thumb = $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src');

          self.items[i] = {
            href: $a,
            //title: $title.trim(),
            title: $title,
            time: $time,
            thumbnail: $thumb,
            urlObj: url.parse($a, true)
          }
      });

          res.render('list', {
            title: 'NodeTube',
            items: self.items
          });
//console.log(self);
      }
    });
  });
});

app.get('/kyoutube', function(req, res) {
  //Tell the request that we want to fetch youtube.com, send the results to a callback function
  request({
    uri: 'http://youtube.com'
  }, function(err, response, body) {
    var self = this;
    self.items = new Array();
    //I feel like I want to save my results in an array
 
    //Just a basic error check
    if (err && response.statusCode !== 200) {
      console.log('Request error.');
    }
 
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    jsdom.env({
      html: body,
      scripts: ['http://code.jquery.com/jquery-1.6.min.js']
    }, function(err, window){
      //Use jQuery just as in a regular HTML page
      var $ = window.jQuery;
      $body = $('body'),
      $videos = $body.find('.feed-item-content');
      $videos.each(function(i, item) {
        var $item = $(item);
        var $description = $item.find('.title');
        var $title = $description.text();
        var $a = $description.attr('href');
        var $time = $item.find('span.video-time').text();
        var $img = $item.find('span.clip img');
        var $thumb = $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src');
 
        self.items[i] = {
          href: $a,
          title: $title.trim(),
          time: $time,
          thumbnail: $thumb,
          urlObj: url.parse($a, true)
        }
      });
 
      console.log(self.items);
      res.end('Done');
    });
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});