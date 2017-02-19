//remove an array of project paths (and related data) from recent_projects.json
function ajaxPost(path, sendArgs, callback, errCallback){
  // construct an HTTP request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.onloadend=function(res){
    //if the server responded with ok status
    var res=JSON.parse(this.responseText);
    if(res.status==='ok'){
      //callback, if any
      if(callback!=undefined){
        callback(res);
      }
    }else{
      if(errCallback!=undefined){
        errCallback(res);
      }
    }
  };
  // send the collected data as JSON
  xhr.send(JSON.stringify(sendArgs));
}

function ajaxGet(path, callback, errCallback){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      var str=xmlhttp.responseText;
      var json=JSON.parse(str);
      //if no errors
      if(json.status==='ok'){
        if(callback!=undefined){
          callback(json);
        }
      }else{
        if(errCallback!=undefined){
          errCallback(json);
        }
      }
    }
  };
  xmlhttp.open("GET",path,true);
  xmlhttp.send();
}
