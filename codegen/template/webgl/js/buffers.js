function codeGen_buffers(txt, args){
  //GENERATE CODE

  var code='';

  var attributeBufferCode=function(progJson, bufferJson){
    var ret='';
    var bufferVar=var_buffer(progJson.name.val, bufferJson.category.val, bufferJson.dimension.val, bufferJson.name.val);
    ret+='//set this buffer as a bind point so following functions refer to this buffer\n';
    ret+='gl.bindBuffer(gl.ARRAY_BUFFER,'+bufferVar+');\n\n';

    var coordSize='/*?*/';
    var verticesVar=var_vertices(progJson.name.val, bufferJson.category.val, bufferJson.dimension.val, bufferJson.name.val);

    switch(bufferJson.dimension.val){
      case 'mat4': coordSize=4;
        break;
      case 'mat3': coordSize=3;
        break;
      case 'mat2': coordSize=2;
        break;
      case 'vec4': coordSize=4;
        break;
      case 'vec3': coordSize=3;
        break;
      case 'vec2': coordSize=2;
        break;
      case 'float': coordSize=4;
        break;
    }

    ret+='//create vertex coordinates\n';
    ret+='var coordSize='+coordSize+', '+verticesVar+'=[ /*vertices*/ \n\n//...\n\n';
    ret+='/*/vertices*/ ];\n\n';
    ret+='var coordQty='+verticesVar+'.length/coordSize;\n\n';
    ret+='//set the vertices on the bound buffer\n';
    ret+='gl.bufferData(gl.ARRAY_BUFFER,new Float32Array('+verticesVar+'),gl.STATIC_DRAW);\n\n';

    return ret;
  };

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    //for each of the program's buffers
    args.cg.children('buffer', progJson, function(bufferJson, v){

      var startBuffer='buffer for: ['+progJson.name.val+'] '+bufferJson.category.val+' '+bufferJson.name.val;

      var endBuffer='/'+startBuffer;
      var startCode='';
      startCode+='\n/*'+startBuffer+'*/\n';
      startCode+='//create buffer... buffers are arrays of binary data uploaded to the GPU\n';
      startCode+='//buffers contain things like positions, normals, texture coordinates, vertex colors, etc...\n';
      var bufferVar=var_buffer(progJson.name.val, bufferJson.category.val, bufferJson.dimension.val, bufferJson.name.val);
      startCode+='var '+bufferVar+'=gl.createBuffer();\n\n';
      var endCode='/*'+endBuffer+'*/\n';

      switch(bufferJson.category.val){
        case 'attribute':
          var customVerticesTxt='';
          //zero in on this buffer
          args.cg.replace(txt, '/*',startBuffer,'*/',function(bufferTxt){
            //zero in on this buffer's vertices
            args.cg.replace(bufferTxt, '/*','vertices','*/',function(verticesTxt){
              customVerticesTxt=verticesTxt;
            });
          });
          //generate the new buffer code
          var newBufferCode=attributeBufferCode(progJson, bufferJson);
          if(customVerticesTxt.length>0){
            //zero in on this buffer's vertices and restore the custom vertices code
            newBufferCode=args.cg.replace(newBufferCode, '/*','vertices','*/',function(oldVerticesTxt){
              return customVerticesTxt;
            });
          }
          //add the modifed buffer to the code
          code+=startCode;
          code+=newBufferCode;
          code+=endCode;
          break;
        case 'texture':




          break;
      }

    });
  });

  //INSERT THE BUFFER CODE INTO txt

  txt=code;

  return {txt:txt};
}
