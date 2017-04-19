function codeGen_fieldPointers(txt, args){

  var code='';

  //GENERATE CODE

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var vertFieldsLookup={}, vertShaderFields='';
    //for each vertex shader-field in this program
    args.cg.children('vertField', progJson, function(vfJson, v){
      var cval=vfJson['category']['val'], dval=vfJson['dimension']['val'], nval=vfJson['name']['val'];
      if(!vertFieldsLookup.hasOwnProperty(cval)){ vertFieldsLookup[cval]={}; }
      if(!vertFieldsLookup[cval].hasOwnProperty(dval)){ vertFieldsLookup[cval][dval]={}; }
      if(!vertFieldsLookup[cval][dval].hasOwnProperty(nval)){ vertFieldsLookup[cval][dval]=[]; }
      vertFieldsLookup[cval][dval].push(nval);
    });
    var fragFieldsLookup={}, fragShaderFields='';
    //for each fragment shader-field in this program
    args.cg.children('fragField', progJson, function(fsJson, f){
      var cval=fsJson['category']['val'], dval=fsJson['dimension']['val'], nval=fsJson['name']['val'];
      if(!fragFieldsLookup.hasOwnProperty(cval)){ fragFieldsLookup[cval]={}; }
      if(!fragFieldsLookup[cval].hasOwnProperty(dval)){ fragFieldsLookup[cval][dval]={}; }
      if(!fragFieldsLookup[cval][dval].hasOwnProperty(nval)){ fragFieldsLookup[cval][dval]=[]; }
      fragFieldsLookup[cval][dval].push(nval);
    });
    var getPointerLine=function(shaderType, cat, dim, name){
      var ret='', progName=var_prog(progJson.name.val);
      switch(cat){
        case 'attribute':
          var attrVar=var_loc(shaderType, progJson.name.val, cat, dim, name);
          ret+='var '+attrVar+'=gl.getAttribLocation('+progName+'[\'program\'],\''+name+'\');\n';
          ret+='gl.enableVertexAttribArray('+attrVar+'); //enable attribute\n';
          break;
        case 'uniform':
          var uniVar=var_loc(shaderType, progJson.name.val, cat, dim, name);
          ret+='var '+uniVar+'=gl.getUniformLocation('+progName+'[\'program\'],\''+name+'\');\n';
          break;
        case 'varying':
          ret+='';
          break;
      } return ret;
    };
    //loop through the grouped vertex shader fields
    args.cg.each(vertFieldsLookup, function(catKey, catJson, c){
      args.cg.each(catJson, function(dimKey, dimJson, d){
        dimJson.sort();
        for(var n=0;n<dimJson.length;n++){
          vertShaderFields+=getPointerLine('vs',catKey, dimKey, dimJson[n]);
        }
      });
    });
    //loop through the grouped fragment shader fields
    args.cg.each(fragFieldsLookup, function(catKey, catJson, c){
      args.cg.each(catJson, function(dimKey, dimJson, d){
        dimJson.sort();
        for(var n=0;n<dimJson.length;n++){
          fragShaderFields+=getPointerLine('fs',catKey, dimKey, dimJson[n]);
        }
      });
    });
    if(vertShaderFields.length>0 || fragShaderFields.length>0){
      if(code.length>0){ code+='\n'; }
      code+='// ['+progJson.name.val+'] pointer locations -------- \n';
    }
    code+=vertShaderFields+fragShaderFields;
  });

  //INSERT THE FIELD POINTER CODE INTO txt

  txt=code;

  return {txt:txt};
}
