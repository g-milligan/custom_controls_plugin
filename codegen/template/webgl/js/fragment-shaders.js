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
