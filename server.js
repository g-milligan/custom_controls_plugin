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

var getReplacedRegion=function(fileBlob, insertTxt, tokenStart, tokenEnd, regionKey){
  var tokenStartKey = tokenStart + regionKey + tokenEnd;
  var tokenEndKey = tokenStart + '/' + regionKey + tokenEnd;
  //<<<</~~~~~\>>>>
  /*
    <<<<    = before token start
    /       = token start
    ~~~~~   = between tokens
    \       = token end
    >>>>    = after token end
  */
  var tokenStartIndex=fileBlob.indexOf(tokenStartKey);
  if(tokenStartIndex!==-1){
    // beforeTokenStart = <<<<
    var beforeTokenStart=fileBlob.substring(0, tokenStartIndex);
    // fileBlob = /~~~~~\>>>>>>
    fileBlob=fileBlob.substring(tokenStartIndex);
    // fileBlob = ~~~~~\>>>>>> or >>>>>>
    fileBlob=fileBlob.substring(tokenStartKey.length);

    //if there is a token end, fileBlob = ~~~~~\>>>>>>
    var tokenEndIndex=fileBlob.indexOf(tokenEndKey);
    var prevBetweenTokens='';
    if(tokenEndIndex!==-1){
      // prevBetweenTokens = ~~~~~
      prevBetweenTokens=fileBlob.substring(0, tokenEndIndex);
      // fileBlob = >>>>>>
      fileBlob=fileBlob.substring(tokenEndIndex + tokenEndKey.length);
    }

    // fileBlob = >>>>>>

    //put it all together with the new insertTxt, replacing the ~~~~~ section
    fileBlob = beforeTokenStart + tokenStartKey + insertTxt + tokenEndKey + fileBlob;
  }
  return fileBlob;
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
        var valsStr=JSON.stringify(vals, undefined, 2);
        fs.writeFileSync(path, valsStr);
        resJson['status']='ok';
      }
    }
    res.send(JSON.stringify(resJson));
  }
});

//load json from a saved _controls.json file
app.post('/load-controls-config', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no path provided'};
    if(req.body.hasOwnProperty('path')){
      var path=req.body.path;
      if(fs.existsSync(path)){
        if(fs.lstatSync(path).isFile()){
          var fileJson=fs.readFileSync(path, 'utf8');
          resJson['json']=fileJson;
          resJson['status']='ok';
        }else{
          resJson['status']='error, not a file, "'+path+'"';
        }
      }else{
        resJson['status']='error, path doesn\'t exist, "'+path+'"';
      }
    }
    res.send(JSON.stringify(resJson));
  }
});

//write code regions into files
app.post('/write-template-regions', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no data provided'};
    if(req.body.hasOwnProperty('data')){
      var data=req.body.data;
      for(var regionKey in data){
        if(data.hasOwnProperty(regionKey)){
          if(data[regionKey].hasOwnProperty('regions')){
            var template_path=data[regionKey]['template_path'];
            var write_path=data[regionKey]['write_path'];
            var fileBlob;
            //if the write file exists
            if(fs.existsSync(write_path)){
              if(fs.lstatSync(write_path).isFile()){
                fileBlob=fs.readFileSync(write_path, 'utf8');
              }else{
                resJson['status']='error, not a file: ' + write_path;
              }
            }else if(fs.existsSync(template_path)){ //if the template file exists
              if(fs.lstatSync(template_path).isFile()){
                fileBlob=fs.readFileSync(template_path, 'utf8');
              }else{
                resJson['status']='error, not a file: ' + template_path;
              }
            }else{
              resJson['status']='error, template path doesn\'t exist [' + template_path + '] AND ';
              resJson['status']+='write path doesn\'t exist either [' + write_path + ']';
            }
            if(fileBlob!=undefined){
              if(data[regionKey]['regions'].length>0){
                var origBlob=fileBlob;
                for(var r=0;r<data[regionKey]['regions'].length;r++){
                  var regionJson=data[regionKey]['regions'][r];

                  var newTxt=regionJson['new_txt'];
                  var tokenStart=regionJson['token_start'];
                  var tokenEnd=regionJson['token_end'];

                  //insert the newTxt into fileBlob
                  fileBlob=getReplacedRegion(fileBlob, newTxt, tokenStart, tokenEnd, regionKey);
                }
                //if any changes were made
                if(origBlob!=fileBlob){
                  fs.writeFileSync(write_path, fileBlob);
                  resJson['status']='ok';
                }else{
                  resJson['status']='error, no changes made to file, "' + regionKey + '", no region changes';
                }
              }else{
                resJson['status']='error, no regions for file, "' + regionKey + '"';
              }
            }
          }
        }
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
