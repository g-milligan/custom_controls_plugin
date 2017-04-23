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

      ret['open']=function(urlKey, vals){
        var res={status:'error, could not get data for key, "'+urlKey+'"'};
        var urlPaths=args['get_url_paths'](vals);
        var urls_lookup=createPathLookupByKey(urlPaths);
        if(urls_lookup.hasOwnProperty(urlKey)){
          var windowJson=urls_lookup[urlKey];
          if(windowJson.hasOwnProperty('path')){
            if(!document.hasOwnProperty('reload_window_args')){
              document['reload_window_args']={};
            }
            if(!document['reload_window_args'].hasOwnProperty('by_key')){
              document['reload_window_args']['by_key']={};
            }
            if(!document['reload_window_args']['by_key'].hasOwnProperty(urlKey)){
              document['reload_window_args']['by_key'][urlKey]={};
            }
            var width=window.innerWidth, height=window.innerHeight;
            var winAttrStr='width='+width+',height='+height;
            var w=window.open(windowJson['path'],urlKey,winAttrStr);
            document['reload_window_args']['by_key'][urlKey]['win']=w;
          }else{
            res['status']='error, "path" not provided for url, "'+urlKey+'"';
          }
        }
        return res;
      };

      ret['reload']=function(urlKey, vals){
        var res={status:'error, could not get data for key, "'+urlKey+'"'};
        var urlPaths=args['get_url_paths'](vals);
        var urls_lookup=createPathLookupByKey(urlPaths);
        if(urls_lookup.hasOwnProperty(urlKey)){
          var windowJson=urls_lookup[urlKey];
          if(windowJson.hasOwnProperty('path')){
            if(!document.hasOwnProperty('reload_window_args')){
              document['reload_window_args']={};
            }
            if(!document['reload_window_args'].hasOwnProperty('by_key')){
              document['reload_window_args']['by_key']={};
            }
            if(!document['reload_window_args']['by_key'].hasOwnProperty(urlKey)){
              document['reload_window_args']['by_key'][urlKey]={};
            }
            var openRes=ret['open'](urlKey, vals);
            if(document['reload_window_args']['by_key'][urlKey].hasOwnProperty('win')){
              var w=document['reload_window_args']['by_key'][urlKey]['win'];
              if(w!=undefined){
                w.document.location.reload();
              }else{
                res['status']='error, cannot reload undefined window object';
              }
            }else{
              res['status']=openRes['status'];
            }
          }else{
            res['status']='error, "path" not provided for url, "'+urlKey+'"';
          }
        }
        return res;
      };

      self['reload']=ret['reload'];
      self['open']=ret['open'];

      return ret;
    }
  };
}());
