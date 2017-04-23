function var_prog(nameVal){
  return 'prog_'+nameVal;
}

function var_loc(shaderType, progName, category, dimension, fieldName){
  var c=category.substring(0,1);
  return shaderType+'Loc_'+progName+'_'+c+'_'+dimension+'_'+fieldName;
}

function var_buffer(progName, category, dimension, fieldName){
  var c=category.substring(0,1);
  return 'buffer_'+progName+'_'+c+'_'+dimension+'_'+fieldName;
}

function var_vertices(progName, category, dimension, fieldName){
  var c=category.substring(0,1);
  return 'vertices_'+progName+'_'+c+'_'+dimension+'_'+fieldName;
}

function var_coordSize(fieldName){
  return 'coordSize_'+fieldName;
}

function var_coordQty(fieldName){
  return 'coordQty_'+fieldName;
}
