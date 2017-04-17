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
