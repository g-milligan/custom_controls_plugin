var codeGen=(function(){

  var lookForArgs={
    selector:'body:first', //where to build the code edit regions
    token_start:'<!--', //default start for the region key tokens
    token_end:'-->', //default end for the region key tokens
    template_files:[
      {
        key:'main',
        path:'codegen/template/new/index.html'
      }
    ],
    regions:[ //define the code regions that get created
      {
        key:'region1',
        label:'Region 1',
        summary:'Region 1 summary',
        token_start:undefined,
        token_end:undefined,
        template_files:['main'], //which files include content from this region
        cm:{
          mode:'javascript' //codemirror type of code this region displays
        },
        update:function(txt, args){

        }
      },
      {
        key:'region2',
        label:'Region 2',
        summary:'Region 2 summary',
        template_files:['main'],
        cm:{
          mode:'javascript'
        },
        update:function(txt, args){

        }
      },
    ]
  };

  var regionDefaultArgs={
    cm:{
      mode:'javascript'
    }
  };

  return{
    initCodemirror:function(textarea, json){
      if(!textarea.hasOwnProperty('init-codemirror')){
        var cmJson=json['cm'];

        var config={
          value:'',
          lineNumbers:true,
          extraKeys:{
            'Ctrl-Space':'autocomplete'
          },
          styleActiveLine:true,
          mode:cmJson['mode'],
          theme:'custom-dark',

        };

        var editor=CodeMirror.fromTextArea(textarea[0],config);

        //wire up code mirror events
        editor.on('change',function(instance,object){

        });
        editor.on('cursorActivity',function(instance,object){

        });
        editor.on('beforeChange',function(instance,object){

        });
      }
    },
    init:function(args){
      var ret={}, self=this;
      if(args==undefined){ args={}; }

      var loadUpDefaultArgs=function(defaultArgs, setArgs){
        //load up the setArgs using getArg() loop
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

      if(args.hasOwnProperty('selector')){
        var selEl=jQuery(args['selector']);
        if(selEl.length>0){
          //attach args to code gen wrap element
          if(selEl.length>1){ selEl=selEl.eq(0); }
          if(!selEl.hasClass('code-gen-init')){
            selEl.append('<div class="code-gen-wrap"></div>');
            var wrap=selEl.children('.code-gen-wrap:last');
            selEl[0]['code_gen_args']=args; selEl.addClass('code-gen-init');
            args['selector_el']=selEl;
            //build code box regions
            if(args.hasOwnProperty('regions')){
              for(var r=0;r<args['regions'].length;r++){
                var region=args['regions'][r];
                if(region.hasOwnProperty('key')){
                  loadUpDefaultArgs(regionDefaultArgs, region);
                  wrap.append('<div data-key="' + region['key'] + '" class="region"></div>');
                  var regionWrap=wrap.children('.region:last');
                  if(region.hasOwnProperty('label')){
                    regionWrap.append('<div class="label">'+region['label']+'</div>');
                  }
                  if(region.hasOwnProperty('summary')){
                    regionWrap.append('<div class="summary">'+region['summary']+'</div>');
                  }
                  regionWrap.append('<div class="textarea"></div>');
                  var textWrap=regionWrap.children('.textarea:last');
                  textWrap.append('<textarea></textarea>');
                  var txtEl=textWrap.children('textarea:first');
                  self['initCodemirror'](txtEl, region);
                }
              }
            }
            //the main write update function that triggers all of the regions' update functions
            ret['update']=function(output_files, vals){

              


            };
          }
        }
      }
      return ret;
    }
  };
}());
