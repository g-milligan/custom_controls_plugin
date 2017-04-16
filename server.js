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

var getRegionKeys=function(start, key, end){
  return {
    start:start + key + end,
    end:start + '/' + key + end
  }
};

var getRegionParts=function(fileBlob, tokenStart, regionKey, tokenEnd){
  var retParts={};
  var rkeys=getRegionKeys(tokenStart, regionKey, tokenEnd);
  var tokenStartKey = rkeys['start'];
  var tokenEndKey = rkeys['end'];
  retParts['before']='';
  retParts['start_key']=tokenStartKey;
  retParts['between']='';
  retParts['end_key']=tokenEndKey;
  retParts['after']='';
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
    retParts['before']=beforeTokenStart;
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
      retParts['between']=prevBetweenTokens;
      // fileBlob = >>>>>>
      fileBlob=fileBlob.substring(tokenEndIndex + tokenEndKey.length);
    }

    // fileBlob = >>>>>>
    retParts['after']=fileBlob;
  } return retParts;
};

var getRegion=function(fileBlob, tokenStart, tokenEnd, regionKey){
  var rkeys=getRegionKeys(tokenStart, regionKey, tokenEnd);
  var parts=getRegionParts(fileBlob, tokenStart, regionKey, tokenEnd);
  return parts['between'];
};

var getReplacedRegion=function(fileBlob, insertTxt, tokenStart, tokenEnd, regionKey){
  var rkeys=getRegionKeys(tokenStart, regionKey, tokenEnd);
  var parts=getRegionParts(fileBlob, tokenStart, regionKey, tokenEnd);
  return parts['before'] + parts['start_key'] + insertTxt + parts['end_key'] + parts['after'];
};

//create directories (if they don't already exist) and write the file
var writeFullFilePath=function(path, fileContent){
  var ret={write:false, created_dirs:[]};
  var dirs=path.split('/');

  //first make sure all of the directories exists
  var parentDirs='';
  for(var d=0;d<dirs.length-1;d++){
    var dir=dirs[d];
    if(parentDirs.length>0){ parentDirs+='/'; }
    parentDirs+=dir;
    if(dir.length>0 && dir!=='.'){ //if this is not the first directory, ./
      //if this directory doesn't already exist
      if(!fs.existsSync(parentDirs)){
        fs.mkdirSync(parentDirs);
        ret['created_dirs'].push(parentDirs);
      }
    }
  }
  //if all parent directories exist, or there are no needed parent directories
  if(parentDirs.length<1 || fs.existsSync(parentDirs)){
    fs.writeFileSync(path, fileContent);
    ret['write']=true;
  }
  return ret;
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
        writeFullFilePath(path, valsStr);
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
      var data=req.body.data; resJson['write_regions']=[];
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
                var origBlob=fileBlob; resJson['write_regions'].push(regionKey);
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
                  writeFullFilePath(write_path, fileBlob);
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

//read code regions from files
app.post('/read-template-regions', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no data provided'};
    if(req.body.hasOwnProperty('data')){
      var data=req.body.data; resJson['errors']=[]; resJson['regions']=[]; var hasReturnCode=false;
      for(var fileKey in data){
        if(data.hasOwnProperty(fileKey)){
          if(data[fileKey].hasOwnProperty('read_path')){
            var read_path=data[fileKey]['read_path'];
            if(fs.existsSync(read_path) && fs.lstatSync(read_path).isFile()){
              var fileBlob=fs.readFileSync(read_path, 'utf8');
              if(data[fileKey].hasOwnProperty('region_count') && data[fileKey]['region_count']>0){
                if(data[fileKey].hasOwnProperty('regions')){
                  for(var regionKey in data[fileKey]['regions']){
                    if(data[fileKey].hasOwnProperty('regions')){
                      var regionJson=data[fileKey]['regions'][regionKey];
                      if(regionJson.hasOwnProperty('token_start') && regionJson.hasOwnProperty('token_end')){
                        var token_start=regionJson['token_start'], token_end=regionJson['token_end'];
                        var regionCode=getRegion(fileBlob, token_start, token_end, regionKey);
                        if(regionCode.length>0){
                          hasReturnCode=true;
                          resJson['regions'].push({
                            file_key:fileKey, region_key:regionKey,
                            code:regionCode
                          });
                        }
                      }else{
                        resJson['errors'].push('error, region, "'+regionKey+'" in file, "'+fileKey+'", must have both "token_start" and "token_end" values');
                      }
                    }
                  }
                }else{
                  resJson['errors'].push('error, no "regions" for file, "' + fileKey + '"');
                }
              }else{
                resJson['errors'].push('error, "region_count" = 0 for file, "' + fileKey + '"');
              }
            }else{
              resJson['errors'].push('error, could not read region code, "'+regionCode+'"... "'+fileKey+'" file path not found or is not a file: '+read_path);
            }
          }else{
            resJson['errors'].push('error, no "read_path" provided for file, "' + fileKey + '"');
          }
        }
      }
      if(hasReturnCode){
        resJson['status']='ok';
      }
    }
    res.send(JSON.stringify(resJson));
  }
});

//write template files that don't have any regions to replace
app.post('/write-template-files', function(req, res){
  var fromUrl=req.headers.referer;
  //if the request came from this local site
  if(isSameHost(fromUrl)){
    var resJson={status:'error, no data provided'};
    if(req.body.hasOwnProperty('data')){
      var data=req.body.data; resJson['copied_files']=[]; resJson['nochange_files']=[]; resJson['error_files']=[];
      resJson['status']='error, no files written, check "error_files" messages, if any';
      for(var fileKey in data){
        if(data.hasOwnProperty(fileKey)){
          var fileJson=data[fileKey];
          if(fileJson.hasOwnProperty('template_path') && fileJson.hasOwnProperty('write_path')){
            if(fs.existsSync(fileJson['template_path']) && fs.lstatSync(fileJson['template_path']).isFile()){
              var templateBlob=fs.readFileSync(fileJson['template_path'], 'utf8');
              //if the file exists at the build path
              if(fs.existsSync(fileJson['write_path']) && fs.lstatSync(fileJson['write_path']).isFile()){
                var writeBlob=fs.readFileSync(fileJson['write_path'], 'utf8');
                //if there were changes to the build file
                if(templateBlob!=writeBlob){
                  //update the build file with the changed template contents
                  writeFullFilePath(fileJson['write_path'], templateBlob);
                  resJson['copied_files'].push(fileJson);
                }else{
                  resJson['nochange_files'].push(fileJson);
                }
              }else{
                //copy the template file to the build location
                writeFullFilePath(fileJson['write_path'], templateBlob);
                resJson['copied_files'].push(fileJson);
              }
              resJson['status']='ok';
            }else{
              resJson['error_files'].push('error, template does not exist, or is not a file, ' + fileJson['template_path']);
            }
          }else{
            resJson['error_files'].push('error, missing "template_path" or "write_path" for file, "' + fileKey + '"');
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
