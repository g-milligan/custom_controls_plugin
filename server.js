var port = 8080;
var host = 'localhost';

var url='http://' + host + ':' + port;

//require
var eol = require('os').EOL;
var express = require('express'); //npm install --save-dev express
var openBrowser = require('open'); //npm install --save-dev open
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser'); //npm install --save-dev body-parser

//function that makes sure ajax requests came from this same page
var isSameHost=function(testUrl){
  var isSame=false;
  var fromUrlNoQs=testUrl;
  if(fromUrlNoQs.indexOf('?')!==-1){
    fromUrlNoQs=fromUrlNoQs.substring(0, fromUrlNoQs.indexOf('?'));
  }
  var thisUrl=url;
  if(thisUrl.lastIndexOf('/')===thisUrl.length-'/'.length){
    thisUrl=thisUrl.substring(0,thisUrl.length-'/'.length);
  }
  if(fromUrlNoQs.lastIndexOf('/')===fromUrlNoQs.length-'/'.length){
    fromUrlNoQs=fromUrlNoQs.substring(0,fromUrlNoQs.length-'/'.length);
  }
  if(thisUrl.indexOf(fromUrlNoQs)===0){
    isSame=true;
  }
  return isSame;
};

//syntaxer root
app.use(express.static(__dirname+'/dist'));
app.use( bodyParser.json() ); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

//function that makes sure ajax requests came from this same page
var isSameHost=function(testUrl){
  var isSame=false;
  var fromUrlNoQs=testUrl;
  if(fromUrlNoQs.indexOf('?')!==-1){
    fromUrlNoQs=fromUrlNoQs.substring(0, fromUrlNoQs.indexOf('?'));
  }
  var thisUrl=url;
  if(thisUrl.lastIndexOf('/')===thisUrl.length-'/'.length){
    thisUrl=thisUrl.substring(0,thisUrl.length-'/'.length);
  }
  if(fromUrlNoQs.lastIndexOf('/')===fromUrlNoQs.length-'/'.length){
    fromUrlNoQs=fromUrlNoQs.substring(0,fromUrlNoQs.length-'/'.length);
  }
  if(thisUrl.indexOf(fromUrlNoQs)===0){
    isSame=true;
  }
  return isSame;
};

var getExt=function(path){
  var ext=path;
  var dotIndex=ext.lastIndexOf('.');
  if(dotIndex!==-1){
    ext=ext.substring(dotIndex+'.'.length);
  }
  ext=ext.toLowerCase(); ext=ext.trim();
  return ext;
};

//***

//request to browse file system
app.post('/browse-files', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no path provided'};
    if(req.body.hasOwnProperty('path')){
      var path=req.body.path;
      if(path.length>0){
        if(fs.existsSync(path)){
          if(fs.lstatSync(path).isDirectory()){
            var prefix, ext;
            if(req.body.hasOwnProperty('prefix')){
              prefix=req.body.prefix;
            }
            if(req.body.hasOwnProperty('ext')){
              ext=req.body.ext;
            }

            resJson['path']=path;
            resJson['files']=[];
            resJson['dirs']=[];
            //read the children of the directory
            var files = fs.readdirSync(path);
            for(var f=0;f<files.length;f++){
              var file=files[f], allowInclude=true;
              if(fs.lstatSync(path+file).isDirectory()){
                if(allowInclude){
                  resJson['dirs'].push(file);
                }
              }else{
                if(ext!=undefined){
                  var e=getExt(file);
                  if(ext.indexOf(e)===-1){
                    allowInclude=false;
                  }
                }
                if(prefix!=undefined){
                  if(allowInclude){
                    allowInclude=false;
                    for(var p=0;p<prefix.length;p++){
                      if(file.indexOf(prefix[p])===0){
                        allowInclude=true;
                        break;
                      }
                    }
                  }
                }
                if(allowInclude){
                  resJson['files'].push(file);
                }
              }
            }
            resJson['status']='ok';
          }else{
            resJson['status']='error, not a directory, "'+path+'"';
          }
        }else{
          resJson['status']='error, path doesn\'t exist, "'+path+'"';
        }
      }else{
        resJson['status']='error, empty path';
      }
    }
    res.send(JSON.stringify(resJson));
  }
});

//request to browse file system
app.post('/write-controls-config', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no path provided'};
    if(req.body.hasOwnProperty('path')){
      var path=req.body.path;
      resJson['status']='error, no vals provided';
      if(req.body.hasOwnProperty('vals')){
        var vals=req.body.vals;
        var valsStr=JSON.stringify(vals);
        fs.writeFileSync(path, valsStr);
        resJson['status']='ok';
      }
    }
    res.send(JSON.stringify(resJson));
  }
});

//***

//start up tab
var server = app.listen(port, function () {
  console.log('Open --> '+url);
  openBrowser(url);
});
