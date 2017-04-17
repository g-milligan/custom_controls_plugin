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
