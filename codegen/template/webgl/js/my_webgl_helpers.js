var gl, canvas;

function initGl(args){
  if(args==undefined){ args={}; }
  if(!args.hasOwnProperty('selector')){ args['selector']='canvas:first'; }
  if(!args.hasOwnProperty('resize')){ args['resize']=true; }
  canvas=jQuery(args['selector']);
  if(canvas.length>0){

    gl=canvas[0].getContext('webgl') || canvas[0].getContext('experimental-webgl');

    if(args['resize']){ initHandleCanvasResize(); }
  }
}

function handleCanvasResize(){
  if(gl){

    //if there are any width or height changes
    var widthChange=canvas.attr('width')!==(canvas[0].clientWidth+'');
    var heightChange=canvas.attr('height')!==(canvas[0].clientHeight+'');

    if(widthChange || heightChange){

      //canvas element attributes for width and height
      if(widthChange){ canvas.attr('width',canvas[0].clientWidth+''); }
      if(heightChange){ canvas.attr('height',canvas[0].clientHeight+''); }

      //gl viewport
      gl.viewport(0, 0, canvas[0].clientWidth, canvas[0].clientHeight);
    }

  }
}

var resize_timeout;
function initHandleCanvasResize(){
  jQuery(window).resize(function(){
    clearTimeout(resize_timeout);
    resize_timeout=setTimeout(function(){
      handleCanvasResize();
    },100);
  });
  handleCanvasResize();
}

function getShaderEl(el){
  if(typeof el==='string'){
    var selector=el;
    var elm=jQuery(el);
    if(elm.length<1){
      elm=jQuery('#'+el);
    }
    el=elm;
    if(el.length>0){
      el[0]['shader_selector']=selector;
    }
  }
  return el;
}

function getShaderText(el){
  var ret;
  el=getShaderEl(el);
  if(el!=undefined && el.length>0){
    var stripTags={
      '/*<![CDATA[*/':'/*]]>*/',
      '/* <![CDATA[ */':'/* ]]> */',
      '/* <![CDATA[*/':'/*]]> */',
      '/*<![CDATA[ */':'/*]]> */',
      '//<![CDATA[\n':'//]]>\n',
      '//<![CDATA[ \n':'//]]> \n',
      '// <![CDATA[\n':'// ]]>\n',
      '// <![CDATA[ \n':'// ]]> \n',
      '/*<!--*/':'/*-->*/',
      '/* <!-- */':'/* --> */',
      '//<!--\n':'//-->\n',
      '// <!-- \n':'// --> \n',
      '// <!--\n':'// -->\n',
      '//<!-- \n':'//--> \n',
    };
    var txt=el.html(); txt=txt.trim(); var changeMade=false;
    for(var startTag in stripTags){
      if(stripTags.hasOwnProperty(startTag)){
        var endTag=stripTags[startTag];
        if(txt.indexOf(startTag)===0){
          changeMade=true;
          txt=txt.replace(startTag, '');
          var lastIndex=txt.lastIndexOf(endTag);
          if(lastIndex!==-1){
            txt=txt.substring(0, lastIndex);
          }
          break;
        }
      }
    }
    if(changeMade){
      ret=txt.trim();
    }
  }
  return ret;
}

function getShaderPropertiesJson(shaderCode){
  var ret;
  if(shaderCode!=undefined && typeof shaderCode=='string'){
    //remove the main code so only the fields are left, if any are included
    var mainIndex=shaderCode.indexOf('void main');
    if(mainIndex!==-1){
      var mainCode=shaderCode;
      mainCode=mainCode.substring(mainIndex);
      mainCode=mainCode.substring(0, mainCode.lastIndexOf('}')+'}'.length);
      shaderCode=shaderCode.replace(mainCode, ''); shaderCode=shaderCode.trim();
      var propsArr=shaderCode.match(/\w+\s+\w+\s+\w+;/g);
      if(propsArr!=undefined && propsArr.length>0){
        ret={};
        for(var p=0;p<propsArr.length;p++){
          var propStr=propsArr[p];
          var lio=propStr.lastIndexOf(';'); if(lio!==-1){ propStr=propStr.substring(0,lio); }
          var propArr=propStr.split(/\s+/g);
          if(!ret.hasOwnProperty(propArr[0])){
            ret[propArr[0]]=[];
          }
          var pushArr=[];
          for(var a=1;a<propArr.length;a++){ pushArr.push(propArr[a]); }
          ret[propArr[0]].push(pushArr);
        }
      }
    }
  }
  return ret;
}

function getShader(el){
  var ret;
  el=getShaderEl(el);
  var txt=getShaderText(el);
  if(txt!=undefined){
    ret={json_type:'shader',code:txt,element:el};
    var shader;
    //1. init shader by type
    var handleFragment=function(){
      ret['type']='fragment'; shader=gl.createShader(gl.FRAGMENT_SHADER);
    };
    var handleVertex=function(){
      ret['type']='vertex'; shader=gl.createShader(gl.VERTEX_SHADER);
    };
    var elType=el.attr('type');
    if(elType!=undefined){
      elType=elType.toLowerCase();
      ret['type_attr']=elType;
      if(elType.indexOf('vertex')!==-1){
        handleVertex();
      }else if(elType.indexOf('fragment')!==-1){
        handleFragment();
      }else{
        handleVertex();
      }
    }else{
      handleVertex();
    }
    //2. bind text code to the shader object
    gl.shaderSource(shader, txt);
    //3. compile shader program
    gl.compileShader(shader);
    //4. was shader successfully compiled?
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      ret['success_compile']=false;
      ret['err']='error: ' + gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
    }else{
      ret['success_compile']=true;
      ret['shader']=shader;

      //pull out shader fields and set them as properties
      var shaderFields=getShaderPropertiesJson(txt);
      if(shaderFields!=undefined){
        ret['fields']=shaderFields;
      }
    }
    if(el[0].hasOwnProperty('shader_selector')){
      ret['selector']=el[0]['shader_selector'];
    }
  }
  return ret;
}

function getProgram(vertexShader, fragmentShader, args){
  var ret;

  if(typeof vertexShader==='string'){ vertexShader=getShader(vertexShader); }
  if(!vertexShader.hasOwnProperty('success_compile') || vertexShader['success_compile']){

    if(typeof fragmentShader==='string'){ fragmentShader=getShader(fragmentShader); }
    if(!fragmentShader.hasOwnProperty('success_compile') || fragmentShader['success_compile']){

      var vs, fs;
      if(vertexShader.hasOwnProperty('shader')){ vs=vertexShader['shader']; }
      if(fragmentShader.hasOwnProperty('shader')){ fs=fragmentShader['shader']; }

      //5. create a program (two shaders)
      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vs);
      gl.attachShader(shaderProgram, fs);
      gl.linkProgram(shaderProgram);

      ret={
        json_type:'program',
        shaders:{
          vertex:vertexShader,
          fragment:fragmentShader
        }
      };

      //6. was program successfully linked?
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        ret['success_link']=false;
        ret['err']='error: ' + gl.getProgramInfoLog(shaderProgram);
      }else{
        ret['success_link']=true;
        ret['program']=shaderProgram;
      }
    }
  }
  if(args!=undefined && args.hasOwnProperty('print_hints') && args['print_hints']){
    console.log(getHints(ret));
  }
  return ret;
}

function getHints(thing){
  var ret='';
  if(thing!=undefined && thing.hasOwnProperty('json_type')){
    var fieldLocations={}, vShaderSelector='', fShaderSelector=''; //stores the field locations in proper hierarchy
    //functions to arrange the code data
    var handleShader=function(shader){
      switch(shader['type']){
        case 'vertex':
          if(shader.hasOwnProperty('selector')){ vShaderSelector=shader['selector']; }
          else { vShaderSelector='vertex-shader'; }
          break;
        case 'fragment':
          if(shader.hasOwnProperty('selector')){ fShaderSelector=shader['selector']; }
          else { vShaderSelector='fragment-shader'; }
          break;
      }
      if(!fieldLocations.hasOwnProperty(shader['type'])){ fieldLocations[shader['type']]={}; }
      if(shader.hasOwnProperty('fields')){
        for(var fieldType in shader['fields']){
          if(shader['fields'].hasOwnProperty(fieldType)){
            var fields=shader['fields'][fieldType];
            if(!fieldLocations[shader['type']].hasOwnProperty(fieldType)){ fieldLocations[shader['type']][fieldType]={}; }
            for(var f=0;f<fields.length;f++){
              var field=fields[f];
              if(!fieldLocations[shader['type']][fieldType].hasOwnProperty(field[0])){ fieldLocations[shader['type']][fieldType][field[0]]=[]; }
              fieldLocations[shader['type']][fieldType][field[0]].push(field[1]);
            }
          }
        }
      }
    };
    //decide how to handle the thing
    switch(thing['json_type']){
      case 'program':
        if(thing['success_link']){
          if(thing.hasOwnProperty('shaders')){
            for(var sKey in thing['shaders']){
              if(thing['shaders'].hasOwnProperty(sKey)){
                var shader=thing['shaders'][sKey];
                handleShader(shader);
              }
            }
          }
        }else{
          ret=thing['err'];
        }
        break;
      case 'shader':
        if(thing['success_compile']){
          handleShader(thing);
        }else{
          ret=thing['err'];
        }
        break;
    }
    //loop function
    var eachLocation=function(itemCallback){
      var shaderTypeIndex=0;
      for(var shaderType in fieldLocations){
        if(fieldLocations.hasOwnProperty(shaderType)){
          var fieldTypeIndex=0;
          for(var fieldType in fieldLocations[shaderType]){
            if(fieldLocations[shaderType].hasOwnProperty(fieldType)){
              var dataTypeIndex=0;
              for(var dataType in fieldLocations[shaderType][fieldType]){
                if(fieldLocations[shaderType][fieldType].hasOwnProperty(dataType)){
                  var fieldNames=fieldLocations[shaderType][fieldType][dataType];
                  fieldNames.sort();
                  for(var nameIndex=0;nameIndex<fieldNames.length;nameIndex++){
                    var name=fieldNames[nameIndex];
                    var args={
                      shaderType:shaderType, fieldType:fieldType, dataType:dataType, name:name,
                      shaderTypeIndex:shaderTypeIndex, fieldTypeIndex:fieldTypeIndex, dataTypeIndex:dataTypeIndex, nameIndex:nameIndex
                    };
                    itemCallback(args);
                  }
                }
                dataTypeIndex++;
              }
            }
            fieldTypeIndex++;
          }
        }
        shaderTypeIndex++;
      }
    };
    //create the code output
    var initCode='', createProgramCode='', getLocationsCode='', setLocationsCode='', enableAttrsCode='', createBufferCode='', drawCode='';

    initCode+='//init canvas and gl, also handle window resize, etc...\n';
    initCode+='initGl();\n\n';
    initCode+='//set background color and depth\n';
    initCode+='gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque\n';
    initCode+='gl.clearDepth(1.0);                 // Clear everything\n';
    initCode+='gl.enable(gl.DEPTH_TEST);           // Enable depth testing\n';
    initCode+='gl.depthFunc(gl.LEQUAL);            // Near things obscure far things\n';

    createProgramCode+='//create and use a program\n';
    createProgramCode+="var pro=getProgram('"+vShaderSelector+"', '"+fShaderSelector+"');\n";
    createProgramCode+="gl.useProgram(pro['program']);\n";

    var hasAttribute=false;
    eachLocation(function(args){
      if(args['nameIndex']===0){
        if(getLocationsCode.length>0){ getLocationsCode+='\n'; }
        if(setLocationsCode.length>0){ setLocationsCode+='\n'; }
        getLocationsCode+='//get '+args['shaderType']+' '+args['dataType']+' '+args['fieldType']+' location(s)\n';
        setLocationsCode+='\t//set '+args['shaderType']+' '+args['dataType']+' '+args['fieldType']+' location value(s)\n';
        switch(args['fieldType']){
          case 'attribute':
            hasAttribute=true;
            getLocationsCode+='//attributes specify how to pull data from a buffer, and push to a vertex shader\n';
            setLocationsCode+='\t//data from the buffer is sent to the attribute...\n';
            setLocationsCode+='\t//for example, each vertex from the buffer is sent to this attribute in the shader\n';
            break;
          case 'uniform':
            getLocationsCode+='//uniforms are global variables you set before executing a shader program\n';
            setLocationsCode+='\t//set uniform values to be sent to the shader program\n';
            break;
        }
      }
      var varName=args['dataType']+"_"+args['name']+"_loc";
      switch(args['fieldType']){
        case 'attribute':
          getLocationsCode+="var "+varName+"=gl.getAttribLocation(pro['program'],'"+args['name']+"');\n";
          if(enableAttrsCode.length<1){ enableAttrsCode+="\n//enable supplying attribute data from a buffer\n"; }
          enableAttrsCode+="gl.enableVertexAttribArray("+varName+");\n";

          setLocationsCode+='\tgl.vertexAttribPointer('+varName+', coordSize, gl.FLOAT, false, 0, 0);\n';
          break;
        case 'uniform':
          getLocationsCode+="var "+varName+"=gl.getUniformLocation(pro['program'],'"+args['name']+"');\n";

          if(args['dataType'].indexOf('mat')===0){
            var num=args['dataType'].substring('mat'.length);
            setLocationsCode+='\tgl.uniformMatrix'+num+'fv('+varName+', false, new Float32Array( /* ...***... */ ));\n';
          }else if(args['dataType'].indexOf('vec')===0){
            var num=args['dataType'].substring('vec'.length);
            setLocationsCode+='\tgl.uniform'+num+'fv('+varName+',  /* ...***... */ );\n';
          }

          break;
      }
    });

    if(hasAttribute){
      createBufferCode+='//create buffer... buffers are arrays of binary data uploaded to the GPU\n';
      createBufferCode+='//buffers contain things like positions, normals, texture coordinates, vertex colors, etc...\n';
      createBufferCode+='var myBuffer=gl.createBuffer();\n\n';
      createBufferCode+='//set this buffer as a bind point so following functions refer to this buffer\n';
      createBufferCode+='gl.bindBuffer(gl.ARRAY_BUFFER,myBuffer);\n\n';
      createBufferCode+='//create vertex coordinates\n';
      createBufferCode+='//*** example vertices...\n';
      createBufferCode+='var coordSize=3, myVertices=[\n';
      createBufferCode+='\t1.0,  1.0,  0.0, //(x,y,z)\n';
      createBufferCode+='\t-1.0, 1.0,  0.0,\n';
      createBufferCode+='\t1.0,  -1.0, 0.0,\n';
      createBufferCode+='\t-1.0, -1.0, 0.0\n';
      createBufferCode+='];\n';
      createBufferCode+='var coordQty=myVertices.length/coordSize;\n\n';
      createBufferCode+='//set the vertices on the bound buffer\n';
      createBufferCode+='gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(myVertices),gl.STATIC_DRAW);\n';
    }
    drawCode+='var draw=function(){\n';
    drawCode+='\t//clear the canvas for next fresh draw\n';
    drawCode+='\tgl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\n\n';
    drawCode+='\t//calculate the values to pass to the shader program\n';
    drawCode+='\t//***\n\n';
    drawCode+=setLocationsCode+'\n';
    drawCode+='\t//execute glsl vertex shader for each vertex... coordQty number of times\n';
    drawCode+='\t//if drawing TRIANGLES, then every 3 coords will be used to make one triangle\n';
    drawCode+='\t//while vertex shader is executed for each vertex, the fragment shader executes for each pixel\n';
    drawCode+='\tgl.drawArrays(gl.TRIANGLE_STRIP, 0, coordQty);\n'
    drawCode+='};\n\n';
    drawCode+='//keep calling the draw function at a regular interval\n';
    drawCode+='setInterval(draw, 15);\n';

    var insertSeparators=function(strArray){
      var str='';
      for(var s=0;s<strArray.length;s++){
        var thisStr=strArray[s].trim();
        if(thisStr.length>0){
          if(str.length>0){ str+='\n\n//-------\n\n'; }
          str+=thisStr;
        }
      }
      return str
    };
    ret+=insertSeparators([initCode, createProgramCode, getLocationsCode, enableAttrsCode, createBufferCode, drawCode]);
  }
  return ret;
}
