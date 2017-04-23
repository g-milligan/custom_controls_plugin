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


      




      return ret;
    }
  };
}());
