function codeGen_draw(txt, args){
  //GENERATE CODE

  var code='';

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var vertFieldsLookup={}, vertLines='';
    //for each vertex shader-field in this program
    args.cg.children('vertField', progJson, function(vfJson, v){
      var cval=vfJson['category']['val'], dval=vfJson['dimension']['val'], nval=vfJson['name']['val'];
      if(!vertFieldsLookup.hasOwnProperty(cval)){ vertFieldsLookup[cval]={}; }
      if(!vertFieldsLookup[cval].hasOwnProperty(dval)){ vertFieldsLookup[cval][dval]={}; }
      if(!vertFieldsLookup[cval][dval].hasOwnProperty(nval)){ vertFieldsLookup[cval][dval]=[]; }
      vertFieldsLookup[cval][dval].push(nval);
    });
    var fragFieldsLookup={}, fragLines='';
    //for each fragment shader-field in this program
    args.cg.children('fragField', progJson, function(fsJson, f){
      var cval=fsJson['category']['val'], dval=fsJson['dimension']['val'], nval=fsJson['name']['val'];
      if(!fragFieldsLookup.hasOwnProperty(cval)){ fragFieldsLookup[cval]={}; }
      if(!fragFieldsLookup[cval].hasOwnProperty(dval)){ fragFieldsLookup[cval][dval]={}; }
      if(!fragFieldsLookup[cval][dval].hasOwnProperty(nval)){ fragFieldsLookup[cval][dval]=[]; }
      fragFieldsLookup[cval][dval].push(nval);
    });

    var coordQtyVar='coordQty';

    var getSendToShaderLine=function(shaderType, cat, dim, name){
      var ret='', progName=var_prog(progJson.name.val);
      var locVar=var_loc(shaderType, progJson.name.val, cat, dim, name);
      var coordSizeVar=var_coordSize(name);
      switch(cat){
        case 'attribute':
          coordQtyVar=var_coordQty(name);
          ret+='//send data from the buffer to the attribute\n';
          ret+='gl.vertexAttribPointer('+locVar+', '+coordSizeVar+', gl.FLOAT, false, 0, 0);\n';
        break; case 'uniform':
          ret+='//send data from javascript to the uniform\n';
          switch(dim){
            case 'float': ret+='gl.uniform1f('+locVar+', v); //for float\n'; break;
            case 'float[]': ret+='gl.uniform1fv('+locVar+', [v]); //for float or float array\n'; break;
            case 'vec2': ret+='gl.uniform2f('+locVar+', v0, v1); //for vec2\n'; break;
            case 'vec2[]': ret+='gl.uniform2fv('+locVar+', [v0, v1]); //for vec2 or vec2 array\n'; break;
            case 'vec3': ret+='gl.uniform3f('+locVar+', v0, v1, v2); //for vec3\n'; break;
            case 'vec3[]': ret+='gl.uniform3fv('+locVar+', [v0, v1, v2]); //for vec3 or vec3 array\n'; break;
            case 'vec4': ret+='gl.uniform4f('+locVar+', v0, v1, v2, v4); //for vec4\n'; break;
            case 'vec4[]': ret+='gl.uniform4fv('+locVar+', [v0, v1, v2, v4]); //for vec4 or vec4 array\n'; break;
            case 'mat2': ret+='gl.uniformMatrix2fv('+locVar+', false, [  4x element array ]) //for mat2 or mat2 array\n'; break;
            case 'mat2[]': ret+='gl.uniformMatrix2fv('+locVar+', false, [  4x element array ]) //for mat2 or mat2 array\n'; break;
            case 'mat3': ret+='gl.uniformMatrix3fv('+locVar+', false, [  9x element array ]) //for mat3 or mat3 array\n'; break;
            case 'mat3[]': ret+='gl.uniformMatrix3fv('+locVar+', false, [  9x element array ]) //for mat3 or mat3 array\n'; break;
            case 'mat4': ret+='gl.uniformMatrix4fv('+locVar+', false, [ 16x element array ]) //for mat4 or mat4 array\n'; break;
            case 'mat4[]': ret+='gl.uniformMatrix4fv('+locVar+', false, [ 16x element array ]) //for mat4 or mat4 array\n'; break;
            case 'int': ret+='gl.uniform1i('+locVar+', v); //for int\n'; break;
            case 'int[]': ret+='gl.uniform1iv('+locVar+', [v]); //for int or int array\n'; break;
            case 'ivec2': ret+='gl.uniform2i('+locVar+', v0, v1); //for ivec2\n'; break;
            case 'ivec2[]': ret+='gl.uniform2iv('+locVar+', [v0, v1]); //for ivec2 or ivec2 array\n'; break;
            case 'ivec3': ret+='gl.uniform3i('+locVar+', v0, v1, v2); //for ivec3\n'; break;
            case 'ivec3[]': ret+='gl.uniform3iv('+locVar+', [v0, v1, v2]); //for ivec3 or ivec3 array\n'; break;
            case 'ivec4': ret+='gl.uniform4i('+locVar+', v0, v1, v2, v4); //for ivec4\n'; break;
            case 'ivec4[]': ret+='gl.uniform4iv('+locVar+', [v0, v1, v2, v4]); //for ivec4 or ivec4 array\n'; break;
            case 'sampler2D': ret+='gl.uniform1i('+locVar+', v); //for sampler2D (textures)\n'; break;
            case 'sampler2D[]': ret+='gl.uniform1iv('+locVar+', [v]); //for sampler2D or sampler2D array\n'; break;
            case 'samplerCube': ret+='gl.uniform1i('+locVar+', v); //for samplerCube (textures)\n'; break;
            case 'samplerCube[]': ret+='gl.uniform1iv('+locVar+', [v]); //for samplerCube or samplerCube array\n'; break;
          }
        break; case 'varying':

          break;
      } return ret;
    };
    //loop through the grouped vertex shader fields
    args.cg.each(vertFieldsLookup, function(catKey, catJson, c){
      args.cg.each(catJson, function(dimKey, dimJson, d){
        dimJson.sort();
        for(var n=0;n<dimJson.length;n++){
          vertLines+=getSendToShaderLine('vs',catKey, dimKey, dimJson[n]);
        }
      });
    });
    //loop through the grouped fragment shader fields
    args.cg.each(fragFieldsLookup, function(catKey, catJson, c){
      args.cg.each(catJson, function(dimKey, dimJson, d){
        dimJson.sort();
        for(var n=0;n<dimJson.length;n++){
          fragLines+=getSendToShaderLine('fs',catKey, dimKey, dimJson[n]);
        }
      });
    });
    code+=vertLines+fragLines;

    //INSERT THE DRAW CODE INTO txt

    var startSendToTxt='send to ['+progJson.name.val+'] shaders';

    //zero-in on the specific send-to-shader section in txt
    txt=args.cg.replace(txt, '/*',startSendToTxt,'*/\n',function(sendToTxt){
      return code;
    }, function(blankNewTxt){
      //brand new code, not yet generated for the first time (append to txt)
      var newCode='';
      newCode+='var draw=function(){\n';
      newCode+='/*draw-clear*/\n';
      newCode+='gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\n';
      newCode+='/*/draw-clear*/\n\n';

      newCode+='/*'+startSendToTxt+'*/\n';
      newCode+=code;
      newCode+='/*/'+startSendToTxt+'*/\n\n';

      newCode+='//execute glsl vertex shader for each vertex... '+coordQtyVar+' number of times\n';
      newCode+='//if drawing TRIANGLES, then every 3 coords will be used to make one triangle\n';
      newCode+='//while vertex shader is executed for each vertex, the fragment shader executes for each pixel\n';
      newCode+='gl.drawArrays(gl.TRIANGLES, 0, '+coordQtyVar+');\n\n';
      newCode+='};\n\n';
      newCode+='//keep calling the draw function at a regular interval\n';
      newCode+='setInterval(draw, 15);\n\n';

      return newCode;
    },false);

  });

  return {txt:txt};
}
