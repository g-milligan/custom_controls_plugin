function codeGen_initPrograms(txt, args){
  //GENERATE CODE

  var progsCode='//create and use a programs\n';

  //for each program
  args.cg.children('program', args.vals, function(progJson, p){
    var pn=progJson.name.val;
    var progName=var_prog(pn);

    progsCode+="var "+progName+"=getProgram('#vs-"+pn+":first', '#fs-"+pn+":first');\n";
    progsCode+="gl.useProgram("+progName+"['program']);\n\n";
  });

  //INSERT THE PROGRAMS' CODE INTO txt

  txt=progsCode;
  return {txt:txt};
}
