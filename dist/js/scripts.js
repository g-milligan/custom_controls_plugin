function codeGen_pageTitle(txt, args){
  return {txt:args['vals']['page-title']['val'] + ' - webgl'};
}

function codeGen_buffers(txt, args){

}

function codeGen_canvas(txt, args){
  return {txt:'<canvas id="canvas">({[d3d caNv4s be s@d c4nvAs]})</canvas>'};
}

function codeGen_draw(txt, args){

}

function codeGen_enableAttributes(txt, args){

}

function codeGen_fieldPointers(txt, args){

}

function codeGen_initJs(txt, args){
  //GENERATE CODE

  txt='';
  txt+='//init canvas and gl, also handle window resize, etc...\n';
  txt+='initGl();\n\n';

  var noDepthTest='//', noObscureDistance='//';
  if(args.vals['depth-test'].val){
    noDepthTest='';
  }
  if(args.vals['obscure-distance'].val){
    noObscureDistance='';
  }

  txt+='//set background color and depth\n';
  txt+='gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque\n';
  txt+='gl.clearDepth(1.0);                 // Clear everything\n';
  txt+=noDepthTest+'gl.enable(gl.DEPTH_TEST);           // Enable depth testing\n';
  txt+=noObscureDistance+'gl.depthFunc(gl.LEQUAL);            // Near things obscure far things\n\n';

  //INSERT THE UPDATED CODE INTO txt
  return {txt:txt};
}

function codeGen_initPrograms(txt, args){
  //GENERATE CODE

  var progsCode='//create and use a programs\n';

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var pn=progJson.name.val;

    progsCode+="var prog_"+pn+"=getProgram('#vs-"+pn+":first', '#fs-"+pn+":first');\n";
    progsCode+="gl.useProgram(prog_"+pn+"['program']);\n\n";
  });

  //INSERT THE PROGRAMS' CODE INTO txt

  txt=progsCode;
  return {txt:txt};
}

function codeGen_vertexShaders(txt, args){

  //GENERATE CODE

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var vertFieldsLookup={}, vertShaderFields='';
    //for each vertex shader-field in this program (add to lookup)
    args.cg.children('vertField', progJson, function(vfJson, v){
      var cval=vfJson['category']['val'], dval=vfJson['dimension']['val'], nval=vfJson['name']['val'];
      if(!vertFieldsLookup.hasOwnProperty(cval)){ vertFieldsLookup[cval]={}; }
      if(!vertFieldsLookup[cval].hasOwnProperty(dval)){ vertFieldsLookup[cval][dval]=[]; }
      //code line
      vertFieldsLookup[cval][dval].push(cval+' '+dval+' '+nval+';');
    });
    //loop through the grouped vertex shader fields
    args.cg.each(vertFieldsLookup, function(catKey, catJson, c){
      args.cg.each(catJson, function(dimKey, dimJson, d){
        dimJson.sort();
        for(var n=0;n<dimJson.length;n++){
          vertShaderFields+=dimJson[n]+'\n'; //add vertex field to code string
        }
      });
    });

    //INSERT THE VERTEX SHADER CODE INTO txt

    //zero-in on the specific vertex shader for this program
    txt=args.cg.replace(txt, '<!--','vertex-shader:'+progJson.name.val,'-->\n',function(vertShaderTxt){
      //replace the fields section that's already in txt

      //zero-in on the vertex shader fields
      vertShaderTxt=args.cg.replace(vertShaderTxt, '/*','fields','*/\n',function(fieldsTxt){
        return vertShaderFields; //set the generated vertex shader fields
      });
      return vertShaderTxt;

    }, function(blankNewTxt){
      //brand new code, not yet generated for the first time (append to txt)
      var newCode='';
      newCode+='<script id="vs-'+progJson.name.val+'" type="x-shader/x-vertex">/*<![CDATA[*/\n';
      newCode+='\n';
      newCode+='/*fields*/\n';
      newCode+=vertShaderFields;
      newCode+='/*/fields*/\n';
      newCode+='\n';
      newCode+='/*for program: '+progJson.name.val+'*/\n';
      newCode+='void main() {\n';
      newCode+='\t//gl_Position = \n';
      newCode+='}\n';
      newCode+='/*]]>*/</script>\n';

      return newCode;
    });

  });
  return {txt:txt};
}

function codeGen_fragmentShaders(txt, args){

    //GENERATE CODE

    //for each program
    args.cg.children('program', args.vals, function(progJson, p){
      var fragFieldsLookup={}, fragShaderFields='';
      //for each fragment shader-field in this program (add to lookup)
      args.cg.children('fragField', progJson, function(vfJson, v){
        var cval=vfJson['category']['val'], dval=vfJson['dimension']['val'], nval=vfJson['name']['val'];
        if(!fragFieldsLookup.hasOwnProperty(cval)){ fragFieldsLookup[cval]={}; }
        if(!fragFieldsLookup[cval].hasOwnProperty(dval)){ fragFieldsLookup[cval][dval]=[]; }
        //code line
        fragFieldsLookup[cval][dval].push(cval+' '+dval+' '+nval+';');
      });
      //loop through the grouped fragment shader fields
      args.cg.each(fragFieldsLookup, function(catKey, catJson, c){
        args.cg.each(catJson, function(dimKey, dimJson, d){
          dimJson.sort();
          for(var n=0;n<dimJson.length;n++){
            fragShaderFields+=dimJson[n]+'\n'; //add fragment field to code string
          }
        });
      });

      //INSERT THE FRAGMENT SHADER CODE INTO txt

      //zero-in on the specific fragment shader for this program
      txt=args.cg.replace(txt, '<!--','fragment-shader:'+progJson.name.val,'-->\n',function(fragShaderTxt){
        //replace the fields section that's already in txt

        //zero-in on the fragment shader fields
        fragShaderTxt=args.cg.replace(fragShaderTxt, '/*','fields','*/\n',function(fieldsTxt){
          return fragShaderFields; //set the generated fragment shader fields
        });
        return fragShaderTxt;

      }, function(blankNewTxt){
        //brand new code, not yet generated for the first time (append to txt)
        var newCode='';
        newCode+='<script id="fs-'+progJson.name.val+'" type="x-shader/x-fragment">/*<![CDATA[*/\n';
        newCode+='\n';
        newCode+='precision mediump float;\n';
        newCode+='/*fields*/\n';
        newCode+=fragShaderFields;
        newCode+='/*/fields*/\n';
        newCode+='\n';
        newCode+='/*for program: '+progJson.name.val+'*/\n';
        newCode+='void main() {\n';
        newCode+='\t//gl_FragColor = \n';
        newCode+='}\n';
        newCode+='/*]]>*/</script>\n';

        return newCode;
      });

    });
    return {txt:txt};
}

//remove an array of project paths (and related data) from recent_projects.json
function ajaxPost(path, sendArgs, callback, errCallback){
  // construct an HTTP request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.onloadend=function(res){
    //if the server responded with ok status
    var res=JSON.parse(this.responseText);
    if(res.status==='ok'){
      //callback, if any
      if(callback!=undefined){
        callback(res);
      }
    }else{
      if(errCallback!=undefined){
        errCallback(res);
      }
    }
  };
  // send the collected data as JSON
  xhr.send(JSON.stringify(sendArgs));
}

function ajaxGet(path, callback, errCallback){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      var str=xmlhttp.responseText;
      var json=JSON.parse(str);
      //if no errors
      if(json.status==='ok'){
        if(callback!=undefined){
          callback(json);
        }
      }else{
        if(errCallback!=undefined){
          errCallback(json);
        }
      }
    }
  };
  xmlhttp.open("GET",path,true);
  xmlhttp.send();
}

var customControls=(function(){

  var lookForArgs={
    key:undefined, //key id for this control
    selector:undefined, //selector, where to place the control
    save_in_folder:undefined, //saves the values into a folder and makes sure the control chooses the file name for the saved values
    label:'[label]', //control label
    type:undefined, //type: input, datalist, select, radio, checkbox, textarea
    option_groups:undefined, //options for datalist or select types
    set_option_group_from:undefined, //choose the option group based on the value of another field, within the field-group
    min_child_groups:1, //minimum required children groups
    max_child_groups:1, //maximum required children groups
    is_valid:function(wrap, valEl){ return true; }, //logic for control validation event
    on_change:function(wrap, valEl){}, //logic for control value change event
    on_set:function(wrap, valEl){}, //logic for control value set event
    columns:undefined, //how many columns should the child controls be divided into
    children:[] //child controls under this parent control (recursive)
  };

  var moreArgsToHave={
    on_load:function(vals){

    },
    submit:{
      label:'Submit',
      submit_on_set:true, //trigger on_submit for every individual on_set?
      on_submit:function(vals){

      }
    }
  };

  return{
    getCtlHtml_checkbox:function(ck,args){
      var html='', self=this;
      html+='<input type="checkbox" class="val" id="'+ck+'" />';
      return html;
    },
    setCtlEvents_checkbox:function(wrap){
      var self=this;
      var args=wrap[0]['custom_ctl_args'];
      var input=wrap.find('.ctl .val:first');
      //wire up events
      input.change(function(e){
        e.preventDefault(); e.stopPropagation();
        args['on_set'](wrap, input);
      });
      //get value
      wrap[0]['custom_ctl_args']['get_value']=function(w){
        var inp=w.find('.ctl .val:first');
        return inp.is(':checked');
      };
      //set value
      wrap[0]['custom_ctl_args']['set_value']=function(w, v, triggerOnSet){
        var inp=w.find('.ctl .val:first');
        if(typeof v==='string'){
          v=v.toLowerCase(); v=v.trim();
          var firstChar=v.substring(0,1);
          if(firstChar==='t'){
            v=true;
          }else if(firstChar==='f'){
            v=false;
          }else if(firstChar==='y'){
            v=true;
          }else if(firstChar==='n'){
            v=false;
          }else{
            switch(v){
              case '1': v=true; break;
              case '0': v=false; break;
            }
          }
        }else if(!isNaN(v)){
          if(v<1){
            v=false;
          }else{
            v=true;
          }
        }
        inp.prop('checked',v);
        if(triggerOnSet){ args['on_set'](w, inp); }
        return inp.is(':checked');
      };
      //disable
      wrap[0]['custom_ctl_args']['disable']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.attr('disabled','disabled');
      };
      //enable
      wrap[0]['custom_ctl_args']['enable']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.attr('disabled','');
        if(inp.removeAttr){
          inp.removeAttr('disabled');
        }
      };
      //focus
      wrap[0]['custom_ctl_args']['focus']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.focus();
      };
    },
    getCtlHtml_datalist:function(ck,args){
      var html='', self=this;
      html+='<input class="val" id="'+ck+'" list="'+ck+'-list" />';
      var setGroupFrom='';
      if(args.hasOwnProperty('set_option_group_from') && args['set_option_group_from']!=undefined){
        setGroupFrom=' data-set-group-from="'+args['set_option_group_from']+'"';
      }
      html+='<datalist id="'+ck+'-list"'+setGroupFrom+'>';
      self['eachOptionInArg'](args, function(groupKey, key, val){
        html+='<option data-group="'+groupKey+'" value="'+key+'">'+val+'</option>';
      });
      html+='</datalist>';
      return html;
    },
    setCtlEvents_datalist:function(wrap){
      var self=this;
      var args=wrap[0]['custom_ctl_args'];
      //generic events for <input> elements
      self['setCtlEvents_allInputs'](wrap);
      //init set-option-group-from, if applied to this control (with different option groups)
      var setFromEl=wrap.find('.ctl [data-set-group-from]:first');
      if(setFromEl.length>0){
        self['initSetGroupFrom'](setFromEl);
      }
    },
    getCtlHtml_select:function(ck,args){
      var html='', self=this;
      var setGroupFrom='';
      if(args.hasOwnProperty('set_option_group_from') && args['set_option_group_from']!=undefined){
        setGroupFrom=' data-set-group-from="'+args['set_option_group_from']+'"';
      }
      html+='<select class="val" id="'+ck+'"'+setGroupFrom+'>';
      self['eachOptionInArg'](args, function(groupKey, key, val){
        html+='<option data-group="'+groupKey+'" value="'+key+'">'+val+'</option>';
      });
      html+='</select>';
      return html;
    },
    setCtlEvents_select:function(wrap){
      var self=this;
      var args=wrap[0]['custom_ctl_args'];
      var select=wrap.find('.ctl .val:first');
      //wire up events
      select.change(function(e){
        e.preventDefault(); e.stopPropagation();
        args['on_set'](wrap, select);
      });
      //get value
      wrap[0]['custom_ctl_args']['get_value']=function(w){
        var sel=w.find('.ctl .val:first');
        return sel.val();
      };
      //set value
      wrap[0]['custom_ctl_args']['set_value']=function(w, v, triggerOnSet){
        if(triggerOnSet==undefined){ triggerOnSet=true; }
        var sel=w.find('.ctl .val:first');
        sel.val(v);
        if(triggerOnSet){ args['on_set'](w, sel); }
        return sel.val();
      };
      //disable
      wrap[0]['custom_ctl_args']['disable']=function(w){
        var sel=w.find('.ctl .val:first');
        sel.attr('disabled','disabled');
      };
      //enable
      wrap[0]['custom_ctl_args']['enable']=function(w){
        var sel=w.find('.ctl .val:first');
        sel.attr('disabled','');
        if(sel.removeAttr){
          sel.removeAttr('disabled');
        }
      };
      //focus
      wrap[0]['custom_ctl_args']['focus']=function(w){
        var sel=w.find('.ctl .val:first');
        sel.focus();
      };
      //init set-option-group-from, if applied to this control (with different option groups)
      var setFromEl=wrap.find('.ctl [data-set-group-from]:first');
      if(setFromEl.length>0){
        self['initSetGroupFrom'](setFromEl);
      }
    },
    getCtlHtml_input:function(ck,args){
      var html='', self=this;
      html+='<input class="val" id="'+ck+'" />';
      return html;
    },
    setCtlEvents_input:function(wrap){
      var self=this;
      var args=wrap[0]['custom_ctl_args'];
      //generic events for <input> elements
      self['setCtlEvents_allInputs'](wrap);
    },








    setCtlEvents_allInputs:function(wrap){
      var self=this;
      var args=wrap[0]['custom_ctl_args'];
      var input=wrap.find('.ctl .val:first');
      //wire up events
      input.blur(function(e){
        e.preventDefault(); e.stopPropagation();
        args['on_set'](wrap, input);
      });
      input.keypress(function(e){
        switch(e.keyCode){
          case 13: //enter key
            e.preventDefault(); e.stopPropagation();
            args['on_set'](wrap, input);
            break;
        }
      });
      input.keyup(function(e){
        e.preventDefault(); e.stopPropagation();
        args['on_change'](wrap, input);
      });
      //get value
      wrap[0]['custom_ctl_args']['get_value']=function(w){
        var inp=w.find('.ctl .val:first');
        return inp.val();
      };
      //set value
      wrap[0]['custom_ctl_args']['set_value']=function(w, v, triggerOnSet){
        var inp=w.find('.ctl .val:first');
        inp.val(v);
        if(triggerOnSet){ args['on_set'](w, inp); }
        return inp.val();
      };
      //disable
      wrap[0]['custom_ctl_args']['disable']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.attr('disabled','disabled');
      };
      //enable
      wrap[0]['custom_ctl_args']['enable']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.attr('disabled','');
        if(inp.removeAttr){
          inp.removeAttr('disabled');
        }
      };
      //focus
      wrap[0]['custom_ctl_args']['focus']=function(w){
        var inp=w.find('.ctl .val:first');
        inp.focus();
      };
    },
    eachOptionInArg:function(args, callback){
      for(var groupKey in args['option_groups']){
        if(args['option_groups'].hasOwnProperty(groupKey)){
          for(var i=0;i<args['option_groups'][groupKey].length;i++){
            var item=args['option_groups'][groupKey][i];
            for(var key in item){
              if(item.hasOwnProperty(key)){
                callback(groupKey, key, item[key]);
                break;
              }
            }
          }
        }
      }
    },
    getCtlHtml:function(wrap,args){
      var html='', ck='', self=this;
      jQuery(wrap.parents('[data-key]').get().reverse()).each(function(){
        if(ck.length>0){ ck+='-'; }
        ck+=jQuery(this).attr('data-key');
      });
      if(ck.length>0){ ck+='-'; }
      ck+=args['key'];
      var childrenWrap=wrap.parents('.children:first');
      var groupIndex=wrap.attr('data-group');
      if(groupIndex!=undefined && groupIndex.length>0){
        ck+='-'+groupIndex;
      }

      html+='<div data-key="'+args['key']+'" class="custom-control-wrap">';
      html+='<label for="'+ck+'">'+args['label']+'</label>';

      if(args.hasOwnProperty('type')){
        html+='<div class="ctl">';
        html+=self['getCtlHtml_'+args['type']](ck,args);
        html+='</div>';
      }
      html+='</div>';

      return html;
    },
    setCtlEvents:function(wrap,args){
      var self=this;
      if(wrap.hasClass('custom-control-wrap')){
        if(!wrap.hasClass('init')){
          wrap.addClass('init');
          wrap[0]['custom_ctl_args']=args;
          if(args.hasOwnProperty('type')){
            self['setCtlEvents_'+args['type']](wrap);
          }
        }
      }
    },
    removeAllReset:function(wr){
      var removeBtns=wr.find('.btn-remove'), self=this;

      //mark elements with either "remove-this" or "update-this" class
      removeBtns.each(function(){
        var childGroup=jQuery(this).parents('.child-group:first');
        childGroup.addClass('remove-this');
        var cw=childGroup.parents('.children:first');
        cw.addClass('update-this');
      });

      //remove "remove-this" elements
      wr.find('.remove-this').remove();

      //update "update-this" elements
      wr.find('.update-this').each(function(){
        self['updateChildGroupCount'](jQuery(this));
      });

      wr.find('.update-this').removeClass('update-this');
    },
    updateChildGroupCount:function(childWrap){
      var self=this;
      var wrap=childWrap.parents('.custom-control-wrap:first');
      var args=wrap[0]['custom_ctl_args'];
      var childGroups=childWrap.children('.child-group');
      childGroups.children('.btn-remove').remove();
      childGroups.removeClass('.has-remove');
      //if can add/remove items
      if(args['max_child_groups'] !== args['min_child_groups']){
        //count label
        var wrapLabel=wrap.children('label:first');
        var spanChildCount=wrapLabel.children('span.child-count:first');
        if(spanChildCount.length<1){
          wrapLabel.append('<span class="child-count"></span>');
          spanChildCount=wrapLabel.children('span.child-count:first');
        }
        spanChildCount.html(childGroups.length+'');
        //expand click event
        if(!wrapLabel.hasClass('init-expand')){
          wrapLabel.addClass('init-expand');
          var w=wrapLabel.parent(); w.addClass('show-children');
          wrapLabel.click(function(e){
            e.preventDefault(); e.stopPropagation();
            if(w.hasClass('show-children')){
              w.removeClass('show-children');
              w.addClass('hide-children');
            }else{
              w.addClass('show-children');
              w.removeClass('hide-children');
            }
          });
        }
      }
      //for each child group
      childGroups.each(function(i){
        if(i+1>args['min_child_groups']){
          jQuery(this).append('<div class="btn-remove"><span>X</span></div>');
          jQuery(this).addClass('has-remove');
          var removeBtn=jQuery(this).children('.btn-remove:last');
          removeBtn.click(function(){
            var removeWrap=jQuery(this).parents('.child-group:first');
            var cw=removeWrap.parents('.children:first');
            removeWrap.remove();
            self['updateChildGroupCount'](cw);

            //save to file, if submit_on_set is turned on
            var topWrap=cw.parents('.custom-control-wrap:last');
            var ma=topWrap[0]['custom_ctl_args']['more_args'];
            if(ma['submit']['submit_on_set']){
              var v=topWrap[0]['custom_ctl_args']['get_values'](topWrap);
              ma['submit']['on_submit'](v);
            }
          });
        }
        //child control count class
        if(args.hasOwnProperty('child_control_count')){
          jQuery(this).removeClass('c'+args['child_control_count']);
        }
        var count=jQuery(this).children('.custom-control-wrap').length;
        wrap[0]['custom_ctl_args']['child_control_count']=count;
        var setCount=count;
        if(wrap[0]['custom_ctl_args'].hasOwnProperty('columns') && wrap[0]['custom_ctl_args']['columns']>0){
          setCount=wrap[0]['custom_ctl_args']['columns'];
        }
        jQuery(this).addClass('c'+setCount);
      });
      if(args['max_child_groups'] < args['min_child_groups'] || childGroups.length < args['max_child_groups']){
        wrap.removeClass('max-children');
      }else{
        wrap.addClass('max-children');
      }

    },
    initSetGroupFrom:function(setFromEl){
      var setFrom=setFromEl.attr('data-set-group-from');
      var childGroupWrap=setFromEl.parents('.child-group:first');
      var setFromWrap=childGroupWrap.children('.custom-control-wrap[data-key="'+setFrom+'"]:first');
      if(setFromWrap.length>0){
        //hide all options at first
        setFromEl.after('<select style="display:none;" class="hidden-group-options"></select>');
        var hiddenSelect=setFromEl.next('.hidden-group-options:first');
        hiddenSelect.append(setFromEl.children('option'));
        //add the event
        var origFunc=setFromWrap[0]['custom_ctl_args']['on_set'];
        setFromWrap[0]['custom_ctl_args']['on_set']=function(w, i){
          //select the options that match this value, if any
          var dk=w.attr('data-key');
          var v=w[0]['custom_ctl_args']['get_value'](w);
          var optionWrap=w.parent().find('[data-set-group-from="'+dk+'"]:first');
          var hidSel=optionWrap.next('.hidden-group-options:first');
          if(optionWrap.children('option').length>0){
            hidSel.append(optionWrap.children('option'));
          }
          var opts=hidSel.children('option[data-group="'+v+'"]');
          if(opts.length>0){
            optionWrap.append(opts);
          }
          var wr=optionWrap.parents('.custom-control-wrap:first');
          if(v.trim().length>0){
            //enable
            wr[0]['custom_ctl_args']['enable'](wr);
            wr[0]['custom_ctl_args']['focus'](wr);
          }else{
            //disable
            wr[0]['custom_ctl_args']['set_value'](wr,'');
            wr[0]['custom_ctl_args']['disable'](wr);
          }
          origFunc(w, i);
        };
        setFromWrap[0]['custom_ctl_args']['on_set'](setFromWrap, setFromWrap.find('.ctl .val:first'));
      }
    },
    initWriteConfigFileJson:function(json){
      var self=this, ccw=json['ccw'], args=json['args'], moreArgs=json['moreArgs'];

      var savePath=args['save_in_folder'];

      //load file changes when a file name is entered
      var originalOnSet=ccw[0]['custom_ctl_args']['on_set'];
      ccw[0]['custom_ctl_args']['on_set']=function(wr, valEl){
        var file=ccw.find('.val.save-in-folder:first').val(); file=file.trim();
        if(file.length>0){
          var loadPath='./'+savePath+'_'+file+'.json';
          ajaxPost('/load-controls-config', {path:loadPath}, function(ret){
            //load saved json
            var confJson=JSON.parse(ret['json']);
            self['setValues'](ccw, confJson);
            //trigger on_load event
            moreArgs['on_load'](savePath, file, confJson);
          }, function(ret){
            //this saved json file doesn't exists



          });
        }
      };

      //write file changes on submit
      var originalOnSubmit=moreArgs['submit']['on_submit'];
      moreArgs['submit']['on_submit']=function(vals){
        originalOnSubmit(vals);
        var file=ccw.find('.val.save-in-folder:first').val(); file=file.trim();
        if(file.length>0){
          var writePath='./'+savePath+'_'+file+'.json';
          ajaxPost('/write-controls-config', {path:writePath, vals:vals}, function(ret){
            //save success message






          }, function(ret){
            //save failed message






          });
        }
      };
    },
    setValues:function(wr, vals){
      var self=this;
      var wrap=wr.parents('.custom-control-wrap:last');
      if(wrap.length<1){
        wrap=wr.parent();
      }else{
        wrap=wrap.parent();
      }

      //press all of the remove buttons
      self['removeAllReset'](wrap);

      //get all of the values into key format and count how many of each key needs a field
      var valsToLoad={};
      var loopValsLvl=function(json, keyStr, countKeys){
        for(var key in json){
          if(json.hasOwnProperty(key)){

            var loadKey=keyStr; var newAddKey=countKeys;
            if(loadKey.length>0){ loadKey+='>'; }
            if(newAddKey.length>0){ newAddKey+='>'; }
            loadKey+=key; newAddKey+=key;

            if(json[key].hasOwnProperty('val')){
              valsToLoad[loadKey]=json[key]['val'];
            }
            if(json[key].hasOwnProperty('children')){
              for(var c=0;c<json[key]['children'].length;c++){
                loopValsLvl(json[key]['children'][c], loadKey+':'+c, newAddKey);
              }
            }
          }
        }
      };
      loopValsLvl(vals, '', '');

      //just a function to convert "key1:index>key2" into a jquery selector
      var keyToSelect=function(k, limitPos){
        var ar=k.split('>');
        var sel='';
        for(var a=0;a<ar.length;a++){
          var item=ar[a];
          var indexSel='';
          if(item.indexOf(':')!==-1){
            indexSel=item.substring(item.lastIndexOf(':')+':'.length);
            if(a+1<ar.length){
              indexSel=' > .children > .child-group[data-group="'+indexSel+'"]';
            }else{
              if(a===0){
                indexSel=':first';
              }else{
                indexSel=':eq('+indexSel+')';
              }
            }
            item=item.substring(0, item.lastIndexOf(':'));
          }
          if(sel.length>0){ sel+=' '; }
          sel+='.custom-control-wrap[data-key="'+item+'"]'+indexSel;
        }
        if(limitPos!=undefined){
          if(sel.lastIndexOf(')')!==sel.length-')'.length){
            sel+=limitPos;
          }
        }
        return sel;
      };

      var btnForKey=function(k){
        var sel=keyToSelect(k);
        var ccw=wrap.find(sel);
        while(ccw.length<1){
          var lastK=k;
          if(k.indexOf('>')!==-1){
            lastK=k.substring(k.lastIndexOf('>')+'>'.length);
          }
          if(lastK.indexOf(':')!==-1){
            k=k.substring(0, k.lastIndexOf(':'));
          }else{
            k=k.substring(0, k.lastIndexOf('>'));
          }
          sel=keyToSelect(k);
          ccw=wrap.find(sel);
        }
        var btn=ccw.children('.btn-add-child-group:last');
        return btn;
      };

      //add based on key
      var addForKeys=function(k){
        var ar=k.split('>'), items='';
        for(var a=0;a<ar.length;a++){
          var item=ar[a];
          if(items.length>0){ items+='>'; }
          items+=item;
          var sel=keyToSelect(items);
          var itemEl=wrap.find(sel);
          if(itemEl.length<1){
            var btn=btnForKey(items);
            btn.click(); //add
          }
        }
      };

      //set all of the values in the vals json
      for(var key in valsToLoad){
        if(valsToLoad.hasOwnProperty(key)){
          var val=valsToLoad[key];
          var sel=keyToSelect(key, ':first');
          var ccw=wrap.find(sel);
          if(ccw.length<1){
            addForKeys(key);
            var ccw=wrap.find(sel);
          }
          var currentVal=ccw[0]['custom_ctl_args'].get_value(ccw);
          if(val!=currentVal){
            //set this value, false = don't trigger event
            ccw[0]['custom_ctl_args'].set_value(ccw, val, false);
          }
        }
      }

    },
    initGetValues:function(moreArgs){
      var self=this;
      //set more args
      if(moreArgs==undefined){
        moreArgs=jQuery('.custom-control-wrap:first')[0]['custom_ctl_args']['more_args'];
      }
      //attach get_values method to wraps
      jQuery('.custom-control-wrap').each(function(){
        if(!jQuery(this)[0]['custom_ctl_args']['get_values']){
          if(!jQuery(this)[0]['custom_ctl_args'].hasOwnProperty('more_args')){
            jQuery(this)[0]['custom_ctl_args']['more_args']=moreArgs;
          }
          //create get_values
          jQuery(this)[0]['custom_ctl_args']['get_values']=function(w, ret){
            if(ret==undefined){ ret={} }
            var wSibs=w.parent().children('.custom-control-wrap');
            var recursiveWrap=function(w){
              var dk=w.attr('data-key');
              ret[dk]={};
              if(w[0]['custom_ctl_args'].hasOwnProperty('get_value')){
                ret[dk]['val']=w[0]['custom_ctl_args']['get_value'](w);
              }
              w.children('.children').children('.child-group').each(function(){
                var groupJson={};
                jQuery(this).children('.custom-control-wrap').each(function(c){
                  if(!ret[dk].hasOwnProperty('children')){
                    ret[dk]['children']=[];
                  }
                  groupJson=jQuery(this)[0]['custom_ctl_args']['get_values'](jQuery(this), groupJson);
                });
                if(ret[dk].hasOwnProperty('children')){
                  ret[dk]['children'].push(groupJson);
                }
              });
              return ret;
            };
            if(wSibs.length>0){
              wSibs.each(function(){
                recursiveWrap(jQuery(this));
              });
            }else{
              recursiveWrap(w);
            }
            return ret;
          };
          //create submit on set
          if(moreArgs['submit']['submit_on_set']){
            var originalOnSet=jQuery(this)[0]['custom_ctl_args']['on_set'];
            jQuery(this)[0]['custom_ctl_args']['on_set']=function(wr, valEl){
              originalOnSet(wr, valEl);
              var topWr=wr.parents('.custom-control-wrap:last');
              if(topWr.length<1){ topWr=wr; }
              var vs=topWr[0]['custom_ctl_args']['get_values'](topWr);
              moreArgs['submit']['on_submit'](vs);
            };
          }
        }
      });
    },
    initControl:function(ctlArgs){
      var ctlJson, parentKey, wrap, index, moreArgs;
      if(ctlArgs.hasOwnProperty('ctlJson')){ ctlJson=ctlArgs['ctlJson']; }
      if(ctlArgs.hasOwnProperty('parentKey')){ parentKey=ctlArgs['parentKey']; }
      if(ctlArgs.hasOwnProperty('wrap')){ wrap=ctlArgs['wrap']; }
      if(ctlArgs.hasOwnProperty('index')){ index=ctlArgs['index']; }
      if(ctlArgs.hasOwnProperty('moreArgs')){ moreArgs=ctlArgs['moreArgs']; }
      var self=this;
      if(ctlJson!=undefined){
        var args={};
        var getArg=function(key, defaultVal){
          if(!ctlJson.hasOwnProperty(key)){
            if(defaultVal!=undefined){
              args[key]=defaultVal;
            }
          }
          else{ args[key]=ctlJson[key]; }
        };
        for(var k in lookForArgs){
          if(lookForArgs.hasOwnProperty(k)){
            getArg(k, lookForArgs[k]);
          }
        }
        if(args.hasOwnProperty('key')){
          if(args.hasOwnProperty('selector') || parentKey!=undefined){
            if(wrap==undefined){
              if(args.hasOwnProperty('selector')){
                wrap=jQuery(args['selector']);
              }else{
                wrap=jQuery('[data-key='+parentKey+']:first');
              }
            }
            if(wrap.length>0){
              //if this is a sub child group
              if(!args.hasOwnProperty('selector')){
                if(wrap.children('.children:last').length<1){
                  wrap.append('<div class="children"><div data-group="0" class="child-group"></div></div>');
                }
                wrap=wrap.children('.children:last').children('.child-group:last');
              }

              //function to build html
              var buildHtml=function(ind){
                wrap.append(self['getCtlHtml'](wrap,args));
                self['setCtlEvents'](wrap.children('.custom-control-wrap:last'),args);
                var ccw=wrap.children('.custom-control-wrap:last');
                ccw.attr('data-index', ind);

                for(var m=0;m<args['min_child_groups'];m++){
                  //recursive build child controls, if any
                  for(var c=0;c<args['children'].length;c++){
                    self['initControl']({ctlJson:args['children'][c], parentKey:args['key'], index:c, moreArgs:moreArgs});
                  }
                }

                //if can add more child groups on the fly
                if(args['min_child_groups']!==args['max_child_groups']){
                  ccw.append('<div class="btn-add-child-group"><span>+ Add <span>'+args['label']+'</span></span></div>');
                  var addBtn=ccw.children('.btn-add-child-group:last');
                  ccw.addClass('can-have-children');
                  addBtn.click(function(){
                    var w=jQuery(this).parents('.custom-control-wrap:first');
                    var childArgs=w[0]['custom_ctl_args']['children'];
                    var childWrap=w.children('.children:last');
                    if(childWrap.length<1){
                      jQuery(this).before('<div class="children"></div>');
                      childWrap=w.children('.children:last');
                    }
                    var newGroupIndex=childWrap.children('.child-group').length;
                    while(childWrap.children('.child-group[data-group="'+newGroupIndex+'"]:first').length>0){
                      newGroupIndex++;
                    }
                    childWrap.append('<div data-group="'+newGroupIndex+'" class="child-group"></div>');
                    for(var c=0;c<childArgs.length;c++){
                      self['initControl']({ctlJson:childArgs[c], parentKey:w.attr('data-key'), wrap:w, index:c, moreArgs:moreArgs});
                    }
                    self['updateChildGroupCount'](w.children('.children:last'));
                    self['initGetValues']();
                  });
                }
                return ccw;
              };

              if(args.hasOwnProperty('save_in_folder')){
                args['type']='datalist';
                //get the saved files in this path
                ajaxPost('/browse-files', {path:args['save_in_folder'], prefix:['_'], ext:['json']}, function(ar){
                  //get options for projects json files already saved in the file system
                  args['option_groups']={default:[]};
                  for(var f=0;f<ar['files'].length;f++){
                    var file=ar['files'][f];
                    file=file.substring(1);
                    file=file.substring(0, file.lastIndexOf('.'));
                    var fileJson={}; fileJson[file]=file;
                    args['option_groups']['default'].push(fileJson);
                  }
                  var ccw=buildHtml(index);
                  ccw.addClass('save-in-folder');
                  ccw.find('.val:first').addClass('save-in-folder');
                  //make sure this ccw appears in the right order
                  var ccwIndex=ccw.attr('data-index'); ccwIndex=parseInt(ccwIndex);
                  if(ccwIndex!==ccw.index()){
                    if(ccwIndex===0){
                      ccw.parent().prepend(ccw); //move first
                    }else{
                      ccw.parent().children().eq(ccwIndex-1).after(ccw); //move after some other previous index
                    }
                  }
                  //finish up delayed init
                  ccw.find('.children').each(function(){
                    self['updateChildGroupCount'](jQuery(this));
                  });
                  self['initGetValues'](moreArgs);
                  //init write configuration to .json file
                  self['initWriteConfigFileJson']({ccw:ccw, args:args, moreArgs:moreArgs});
                },function(ar){
                  buildHtml(index);
                });
              }else{
                buildHtml(index);
              }

            }
          }
        }
      }
    },
    init:function(ctlArray, moreArgs){
      if(moreArgs==undefined){ moreArgs={}; }
      var getArg=function(key, defaultVal){
        if(!moreArgs.hasOwnProperty(key)){
          if(defaultVal!=undefined){
            moreArgs[key]=defaultVal;
          }
        }
      };
      var getSubArg=function(key, subKey, defaultVal){
        if(!moreArgs[key].hasOwnProperty(subKey)){
          if(defaultVal!=undefined){
            moreArgs[key][subKey]=defaultVal;
          }
        }
      };
      for(var k in moreArgsToHave){
        if(moreArgsToHave.hasOwnProperty(k)){
          getArg(k, moreArgsToHave[k]);
        }
      }
      for(var k in moreArgsToHave['submit']){
        if(moreArgsToHave['submit'].hasOwnProperty(k)){
          getSubArg('submit', k, moreArgsToHave['submit'][k]);
        }
      }
      var ret={}, self=this;
      if(ctlArray!=undefined && ctlArray.length>0){
        for(var c=0;c<ctlArray.length;c++){
          self['initControl']({ctlJson:ctlArray[c], index:c, moreArgs:moreArgs});
        }
        jQuery('.custom-control-wrap .children').each(function(){
          self['updateChildGroupCount'](jQuery(this));
        });
        //all top level controls
        var topLevelControls=jQuery('.custom-control-wrap').not('.custom-control-wrap .custom-control-wrap');
        ret['top_wraps']=topLevelControls;
        self['initGetValues'](moreArgs);
        ret['get_values']=function(w){
          return w[0]['custom_ctl_args']['get_values'](w);
        }
      }
      return ret;
    }
  };
}());

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
            end:tokenStartIndex+tokenEndKey,
            startKey:tokenStartKey,
            endKey:tokenEndKey
          };
        }
      }
      return ret;
    },
    //function used in the region code generators to select substring regions
    replace:function(txt, startToken, token, endToken, regenCallback, firstCallback){
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
            txt+=tokenRegions['startKey'] + firstCode + tokenRegions['endKey'];
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
