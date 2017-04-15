function codeGen_vertexShaders(txt, args){

  //GENERATE CODE
  var vertShaderFields='';

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var vertFieldsLookup={};
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
      newCode+=vertShaderFields+'\n';
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
