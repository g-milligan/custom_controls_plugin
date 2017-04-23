var reloadWindow=(function(){

  var lookForArgs={
    get_url_paths:function(vals){
      return [
        {
          key:'main',
          path:'codegen/build/new/index.html'
        }
      ]
    }
  };

  return{
    init:function(args){
      var ret={}, self=this;
      if(args==undefined){ args={}; }

      var loadUpDefaultArgs=function(defaultArgs, setArgs){
        for(var key in defaultArgs){
          if(!setArgs.hasOwnProperty(key)){
            if(defaultArgs.hasOwnProperty(key)){
              var val=defaultArgs[key];
              setArgs[key]=val;
            }
          }
        }
      };
      loadUpDefaultArgs(lookForArgs, args);

      var createPathLookupByKey=function(urlArray, callback){
        var ret;
        if(urlArray!=undefined && urlArray.length>0){
          ret={};
          for(var u=0;u<urlArray.length;u++){
            var ujson=urlArray[u]; var key=ujson['key'];
            ret[key]=ujson;
            if(callback!=undefined){
              callback(key, ujson, u);
            }
          }
        } return ret;
      };


      ret['reload']=function(urlKey, vals){
        var res={status:'error, could not get data for key, "'+urlKey+'"'};
        var urlPaths=self['get_url_paths'](vals);
        var urls_lookup=createPathLookupByKey(urlPaths);
        if(urls_lookup.hasOwnProperty(urlKey)){








        }
        return res;
      };

      ret['open']=function(urlKey, vals){
        var res={status:'error, could not get data for key, "'+urlKey+'"'};
        var urlPaths=self['get_url_paths'](vals);
        var urls_lookup=createPathLookupByKey(urlPaths);
        if(urls_lookup.hasOwnProperty(urlKey)){








        }
        return res;
      };

      self['reload']=ret['reload'];
      self['open']=ret['open'];

      return ret;
    }
  };
}());
