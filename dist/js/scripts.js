function codeGen_pageTitle(txt, args){
  
}

function codeGen_buffers(txt, args){

  var test='';
}

function codeGen_canvas(txt, args){
  
}

function codeGen_draw(txt, args){

}

function codeGen_enableAttributes(txt, args){

}

function codeGen_fieldPointers(txt, args){

}

function codeGen_initJs(txt, args){

}

function codeGen_initPrograms(txt, args){

}

function codeGen_shaders(txt, args){

}

var customControls=(function(){

  var lookForArgs={
    key:undefined, //key id for this control
    selector:undefined, //selector, where to place the control
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
    submit:{
      label:'Submit',
      submit_on_set:true, //trigger on_submit for every individual on_set?
      on_submit:function(vals){

      }
    }
  };

  return{

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
      wrap[0]['custom_ctl_args']['set_value']=function(w, v){
        var sel=w.find('.ctl .val:first');
        sel.val(v);
        args['on_set'](w, sel);
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
      wrap[0]['custom_ctl_args']['set_value']=function(w, v){
        var inp=w.find('.ctl .val:first');
        inp.val(v);
        args['on_set'](w, inp);
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
    initGetValues:function(moreArgs){
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
    initControl:function(ctlJson, parentKey, wrap){
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

              wrap.append(self['getCtlHtml'](wrap,args));
              self['setCtlEvents'](wrap.children('.custom-control-wrap:last'),args);

              for(var m=0;m<args['min_child_groups'];m++){
                //recursive build child controls, if any
                for(var c=0;c<args['children'].length;c++){
                  self['initControl'](args['children'][c], args['key']);
                }
              }
              //if can add more child groups on the fly
              if(args['min_child_groups']!==args['max_child_groups']){
                var ccw=wrap.children('.custom-control-wrap:last');
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
                    self['initControl'](childArgs[c], w.attr('data-key'), w);
                  }
                  self['updateChildGroupCount'](w.children('.children:last'));
                  self['initGetValues']();
                });
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
          self['initControl'](ctlArray[c]);
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
        mode:'***', //codemirror type of code this region displays
        token_start:undefined,
        token_end:undefined,
        template_files:['main'], //which files include content from this region
        cm:{
          mode:'javascript'
        },
        update:function(txt, args){

        }
      },
      {
        key:'region2',
        label:'Region 2',
        summary:'Region 2 summary',
        mode:'***',
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
            //the main update function that triggers all of the regions' update functions
            ret['update']=function(output_files, vals){

            };
          }
        }
      }
      return ret;
    }
  };
}());
