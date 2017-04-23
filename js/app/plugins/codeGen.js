var codeGen=(function(){

  var lookForArgs={
    selector:'body:first', //where to build the code edit regions
    template_files:[
      {
        key:'main',
        path:'codegen/template/new/index.html'
      }
    ],
    get_write_files:function(vals){
      return [
        {
          key:'main',
          path:'codegen/build/new/index.html'
        }
      ];
    },
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
    ],
    on_blur:function(){

    },
    on_change:function(){

    },
    on_beforeChange:function(){

    },
    on_cursorActivity:function(){

    }
  };

  var regionDefaultArgs={
    token_start:'<!--', //default start for the region key tokens
    token_end:'-->', //default end for the region key tokens
    cm:{
      mode:'javascript'
    }
  };

  return{
    //function used in the region code generators to travers json items
    children:function(parentKey, vals, itemCallback){
      if(itemCallback!=undefined){
        if(vals.hasOwnProperty(parentKey)){
          var parentNode=vals[parentKey];
          if(parentNode.hasOwnProperty('children')){
            for(var c=0;c<parentNode['children'].length;c++){
              var itemJson=parentNode['children'][c];
              itemCallback(itemJson, c);
            }
          }
        }
      }
    },
    //each json node
    each:function(json, itemCallback){
      var i=0;
      for(var key in json){
        if(json.hasOwnProperty(key)){
          itemCallback(key, json[key], i);
          i++;
        }
      }
    },
    //get the text between two tokens
    getBetweenTokens:function(txt, tokenStart, regionKey, tokenEnd){
      var ret;
      var tokenStartKey = tokenStart + regionKey + tokenEnd;
      var tokenEndKey = tokenStart + '/' + regionKey + tokenEnd;
      ret={
        startKey:tokenStartKey,
        endKey:tokenEndKey
      };
      //txt = <<<</~~~~~\>>>>
      /*
        <<<<    = before token start
        /       = token start
        ~~~~~   = between tokens
        \       = token end
        >>>>    = after token end
      */
      var tokenStartIndex=txt.indexOf(tokenStartKey);
      if(tokenStartIndex!==-1){
        // beforeTokenStart = <<<<
        var beforeTokenStart=txt.substring(0, tokenStartIndex);
        // txt = ~~~~~\>>>>>>
        txt=txt.substring(tokenStartIndex+tokenStartKey.length);

        //if there is a token end, txt = ~~~~~\>>>>>>
        var tokenEndIndex=txt.indexOf(tokenEndKey);
        if(tokenEndIndex!==-1){
          //afterTokenEnd = >>>>>>
          var afterTokenEnd=txt.substring(tokenEndIndex+tokenEndKey.length);
          // txt = ~~~~~
          txt=txt.substring(0, tokenEndIndex);
          ret={
            before:beforeTokenStart,
            between:txt,
            after:afterTokenEnd,
            start:tokenStartIndex,
            end:tokenStartIndex+tokenEndIndex,
            startKey:tokenStartKey,
            endKey:tokenEndKey
          };
        }
      }
      return ret;
    },
    //function used in the region code generators to select substring regions
    replace:function(txt, startToken, token, endToken, regenCallback, firstCallback, setTokensForFirstCallback){
      if(setTokensForFirstCallback==undefined){ setTokensForFirstCallback=true; }
      var self=this, ret=txt;
      if(regenCallback!=undefined){
        var tokenRegions=self['getBetweenTokens'](txt, startToken, token, endToken);
        //if the token section is in the txt
        if(tokenRegions.hasOwnProperty('between')){
          //replace text between the start and end keys
          var newBetween=regenCallback(tokenRegions['between']);
          ret=tokenRegions['before']+tokenRegions['startKey'] + newBetween + tokenRegions['endKey']+tokenRegions['after'];
        }else{ //token section not in the txt, or txt may be blank because this section of the template may never have been generated yet
          if(firstCallback!=undefined){
            //append the new code
            var firstCode=firstCallback(txt);
            if(setTokensForFirstCallback){
              txt+=tokenRegions['startKey'] + firstCode + tokenRegions['endKey'];
            }else{
              txt+=firstCode;
            }
            ret=txt;
          }
        }
      }
      return ret;
    },



    initCodemirror:function(textarea, json, allArgs){
      var self=this;
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


          if(json.hasOwnProperty('on_change')){
            json['on_change'](instance,object,self);
          }else{
            allArgs['on_change'](instance,object,self);
          }
        });
        editor.on('cursorActivity',function(instance,object){


          if(json.hasOwnProperty('on_cursorActivity')){
            json['on_cursorActivity'](instance,object,self);
          }else{
            allArgs['on_cursorActivity'](instance,object,self);
          }
        });
        editor.on('beforeChange',function(instance,object){




          if(json.hasOwnProperty('on_beforeChange')){
            json['on_beforeChange'](instance,object,self);
          }else{
            allArgs['on_beforeChange'](instance,object,self);
          }
        });
        editor.on('blur',function(instance,object){




          if(json.hasOwnProperty('on_blur')){
            json['on_blur'](instance,object,self);
          }else{
            allArgs['on_blur'](instance,object,self);
          }
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
                  self['initCodemirror'](txtEl, region, args);
                  regionWrap[0]['region_args']=region;
                }
              }
            }
            var createFileLookupByKey=function(fJsonArray, callback){
              var ret;
              if(fJsonArray!=undefined && fJsonArray.length>0){
                ret={};
                for(var f=0;f<fJsonArray.length;f++){
                  var fjson=fJsonArray[f]; var key=fjson['key'];
                  ret[key]=fjson;
                  if(callback!=undefined){
                    callback(key, fjson, f);
                  }
                }
              } return ret;
            };
            //the main write update function that triggers all of the regions' update functions, based on modified vals
            //1) outputs the edited text to the frontend
            //2) writes edited text into the template file(s)
            ret['update']=function(vals, doWriteToFile){
              if(doWriteToFile==undefined){ doWriteToFile=true; }
              var output_files=args['get_write_files'](vals);
              //arrange output files so they can be looked up by their key
              var output_files_lookup=createFileLookupByKey(output_files);
              //arrange the input/template files so they can be looked up by their key
              var unprocessedFileKeys=[];
              var input_files_lookup=createFileLookupByKey(args['template_files'], function(key, fjson, f){
                unprocessedFileKeys.push(key);
              });
              //for each region (get the text-code that needs to be written to file)
              var writeData={}, hasWriteData=false;
              var codeGenwrap=selEl.find('.code-gen-wrap:first');
              codeGenwrap.children('.region').each(function(){
                var regionEl=jQuery(this);
                var dataKey=regionEl.attr('data-key');
                var regionArgs=regionEl[0]['region_args'];
                //figure out the file(s) in which this region appears
                for(var f=0;f<regionArgs['template_files'].length;f++){
                  var ufkIndex=unprocessedFileKeys.indexOf(regionArgs['template_files'][f]);
                  if(ufkIndex!==-1){
                    unprocessedFileKeys.splice(ufkIndex,1);
                  }
                }
                var txt=regionArgs['cm']['editor'].doc.getValue();
                var newTxt=txt;
                //update the region's content
                var txtPath=regionArgs['update'](txt, {
                  cg:self, key:dataKey, vals:vals,
                  region_args:regionArgs, frontend_wrap:regionEl
                });
                if(txtPath==undefined){ txtPath=''; }
                if(typeof txtPath==='string'){ txtPath={txt:txtPath}; }
                if(txtPath.hasOwnProperty('txt')){ newTxt=txtPath['txt']; }
                if(newTxt!=txt){
                  //set the frontend textarea's updated value
                  regionArgs['cm']['editor'].doc.setValue(newTxt);
                }
                //if not simply loading the correct text for the region areas, and also must write changes to file
                if(doWriteToFile){
                  //for each template file writePath defined to hold this region as a substring
                  for(var f=0;f<regionArgs['template_files'].length;f++){
                    var pathKey=regionArgs['template_files'][f];
                    //set this as one of the code chunks to be written into file(s)
                    var writePath;
                    if(output_files_lookup!=undefined && output_files_lookup.hasOwnProperty(pathKey)){
                      writePath=output_files_lookup[pathKey]['path'];
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
              //if there are any unprocessed files (ie: files that don't contain dynamic regions)
              if(doWriteToFile && unprocessedFileKeys.length>0){
                var writeFiles={};
                for(var u=0;u<unprocessedFileKeys.length;u++){
                  var ukey=unprocessedFileKeys[u];
                  var input=input_files_lookup[ukey];
                  var output=output_files_lookup[ukey];
                  if(input!=undefined && output!=undefined){
                    writeFiles[ukey]={
                      template_path:input['path'],
                      write_path:output['path']
                    };
                  }
                }
                ajaxPost('/write-template-files', {data:writeFiles},
                function(ret){
                  if(ret['copied_files'].length>0){
                    //write successful




                  }else{
                    //there may have been no changes to copy over



                  }
                }, function(ret){
                  //write error




                });
              }
            };
            //1) outputs the edited text to the frontend
            ret['load']=function(vals){
              var output_files=args['get_write_files'](vals);
              var codeGenwrap=selEl.find('.code-gen-wrap:first');
              //arrange output files so they can be looked up by their key
              var output_files_lookup=createFileLookupByKey(output_files);
              var readData={}, hasReadData=false;
              //for each frontend region
              codeGenwrap.children('.region').each(function(){
                var regionEl=jQuery(this);
                var dataKey=regionEl.attr('data-key');
                var regionArgs=regionEl[0]['region_args'];
                //for each template file writePath defined to hold this region as a substring
                for(var f=0;f<regionArgs['template_files'].length;f++){
                  var pathKey=regionArgs['template_files'][f];
                  //set this as one of the code chunks to be written into file(s)
                  var writePath;
                  if(output_files_lookup!=undefined && output_files_lookup.hasOwnProperty(pathKey)){
                    writePath=output_files_lookup[pathKey]['path'];
                  }
                  if(writePath!=undefined){
                    if(!readData.hasOwnProperty(pathKey)){
                      readData[pathKey]={};
                      readData[pathKey]['region_count']=0;
                      readData[pathKey]['read_path']=writePath;
                      readData[pathKey]['regions']={};
                    }
                    readData[pathKey]['region_count']+=1;
                    readData[pathKey]['regions'][regionArgs['key']]={
                      token_start:regionArgs['token_start'],
                      token_end:regionArgs['token_end']
                    };
                    hasReadData=true;
                  }
                }
              });
              if(hasReadData){
                ajaxPost('/read-template-regions', {data:readData},
                function(ret){
                  //read successful

                  //for each region with return data
                  for(var r=0;r<ret['regions'].length;r++){
                    var regionData=ret['regions'][r];
                    var regionKey=regionData['region_key'];
                    var code=regionData['code'];
                    //set the region code into the frontend region element
                    var regionEl=selEl.find('.code-gen-wrap:first').find('.region[data-key="'+regionKey+'"]:first');
                    if(regionEl.length>0){
                      var regionArgs=regionEl[0]['region_args'];
                      regionArgs['cm']['editor'].doc.setValue(code); //set the code that was loaded from file region
                    }
                  }
                }, function(ret){
                  //read error



                });
              }
            };
            self['update']=ret['update'];
            self['load']=ret['load'];
          }
        }
      }
      return ret;
    }
  };
}());
