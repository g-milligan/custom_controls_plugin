var codeGen=(function(){

  var lookForArgs={
    selector:undefined, //the selector for where to build the code
    token_start:'<!--', //default start for the region key tokens
    token_end:'-->', //default end for the region key tokens
    regions:[ //define the code regions that get created
      {
        key:'region1',
        token_start:undefined,
        token_end:undefined,
        update:function(txt, args){

        }
      },
      {
        key:'region2',
        update:function(txt, args){

        }
      },
    ]
  };

  return{
    init:function(args){
      var ret={};
      //the main update function that triggers all of the regions' update functions
      ret['update']=function(vals){

      };


      return ret;
    }
  };
}());
