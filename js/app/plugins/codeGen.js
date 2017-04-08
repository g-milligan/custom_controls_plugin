var codeGen=(function(){

  var lookForArgs={
    selector:'body:first', //where to build the code edit regions
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
    token_start:'<!--', //default start for the region key tokens
    token_end:'-->', //default end for the region key tokens
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
        cmJson['editor']=editor;

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
                  regionWrap[0]['region_args']=region;
                }
              }
            }
            //the main write update function that triggers all of the regions' update functions, based on modified vals
            ret['update']=function(output_files, vals){
              //arrange output files so they can be looked up by their key
              var output_files_lookup, input_files_lookup={};
              if(output_files!=undefined){
                output_files_lookup={};
                for(var f=0;f<output_files.length;f++){
                  var fjson=output_files[f]; var key=fjson['key'];
                  output_files_lookup[key]=fjson;
                }
              }
              //arrange the input/template files so they can be looked up by their key
              for(var t=0;t<args['template_files'].length;t++){
                var tjson=args['template_files'][t]; var key=tjson['key'];
                input_files_lookup[key]=tjson;
              }
              //for each region (get the data that needs to be written to file)
              var writeData={}, hasWriteData=false;
              var codeGenwrap=selEl.find('.code-gen-wrap:first');
              codeGenwrap.children('.region').each(function(){
                var regionEl=jQuery(this);
                var dataKey=regionEl.attr('data-key');
                var regionArgs=regionEl[0]['region_args'];
                var txt=regionArgs['cm']['editor'].doc.getValue();
                var newTxt=txt;
                //update the region's content
                var txtPath=regionArgs['update'](txt, {
                  code_gen:self, key:dataKey, vals:vals,
                  region_args:regionArgs, frontend_wrap:regionEl
                });
                if(txtPath==undefined){ txtPath=''; }
                if(typeof txtPath==='string'){ txtPath={txt:txtPath}; }
                if(txtPath.hasOwnProperty('txt')){ newTxt=txtPath['txt']; }
                if(newTxt!=txt){
                  //set the frontend textarea's updated value
                  regionArgs['cm']['editor'].doc.setValue(newTxt);
                  //for each template file writePath defined to hold this region as a substring
                  for(var f=0;f<regionArgs['template_files'].length;f++){
                    var pathKey=regionArgs['template_files'][f];
                    //set this as one of the code chunks to be written into file(s)
                    var writePath;
                    if(output_files_lookup!=undefined && output_files_lookup.hasOwnProperty(pathKey)){
                      writePath=output_files_lookup[pathKey]['path'];
                    }else{
                      if(txtPath.hasOwnProperty('path')){
                        writePath=txtPath['path'];
                      }
                    }
                    if(writePath!=undefined){
                      //get the original template path
                      if(input_files_lookup.hasOwnProperty(pathKey)){
                        var templatePath=input_files_lookup[pathKey]['path'];
                        if(!writeData.hasOwnProperty(dataKey)){
                          writeData[dataKey]={};
                          writeData[dataKey]['template_path']=templatePath;
                          writeData[dataKey]['write_path']=writePath;
                          writeData[dataKey]['regions']=[];
                        }
                        writeData[dataKey]['regions'].push({
                          token_start:regionArgs['token_start'],
                          token_end:regionArgs['token_end'],
                          new_txt:newTxt
                        });
                        hasWriteData=true;
                      }
                    }
                  }
                }
              });
              //if there is any data to write
              if(hasWriteData){
                ajaxPost('/write-template-regions', {data:writeData},
                function(ret){
                  //write successful





                }, function(ret){
                  //write error





                });
              }
            };
          }
        }
      }
      return ret;
    }
  };
}());
