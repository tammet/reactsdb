/* 
 
 Autoreact modals

*/
  

import * as autolang from './autolang.js';


// ====== module start =========

// ====== exported functions =========
  
// ---- getting some defaults ------- 

function getModalHelpLengthLimit() {
  return globalState.modalHelpLengthLimit;
}

/* -------- modal confirmation and input and wizard -------- */

function modalGetValue(desc,callback) {
  $("#inputModalDescription").html(desc);
  $("#inputModal").on('hidden.bs.modal', function (e) {      
    $('#inputModal').unbind('hidden.bs.modal');    
    callback($("#inputModalInput").val());
  })
  $("#inputModalInput").val("");
  $("#inputModal").modal('show');
}

function modalConfirm(desc,callback) {
  $("#confirmModalDescription").html(desc);
  $("#confirmModal").on('hidden.bs.modal', function (e) {      
    $('#confirmModal').unbind('hidden.bs.modal');    
    callback($("#confirmModalInput").val());
  })
  $("#confirmModalInput").val("");
  $("#confirmModal").modal('show');
}

function modalWizard(rules,callback) {
  var show=makeWizardHtml(rules,{});
  $("#wizardModalDescription").html(show);
  $("#wizardModal").on('hidden.bs.modal', function (e) {      
    $('#wizardModal').unbind('hidden.bs.modal');    
    callback($("#wizardModalInput").val());
  })
  //$("#wizardModalInput").val("");
  $("#wizardModal").modal('show');
  makeWizardReact();
}

function makeWizardHtml(rules,prefill) {
  //console.log(rules);
  var html,case1,case2,v,v1,v2,tmp;
  if (prefill===null) {
    return null;
  }
  if (!rules || !_.isArray(rules)) {
    html="<div class='wizardinner'>";
    var txt="Jätkamiseks vajuta palun ok: ";
    txt+=" seepeale avatakse osaliselt eeltäidetud vorm, mille täitmist ";
    txt+=" tuleb jätkata. Kohustuslikud väljad on märgitud punase tärniga.";
    txt+=" Osaliselt täidetud vormi saad vahepeal salvestada.";   
    html+=autolang.trans(txt);
    //html+="<p>+"+JSON.stringify(prefill)+"<p>";
    case1='';    
    prefill.infosystem_status="asutamine_sisestamisel";
    $("#wizardModalInput").val(JSON.stringify(prefill));
    html+="<p><button onclick='"+case1+"' class='btn btn-primary btn-sm trans' ";
    html+=" data-dismiss='modal'>"
    html+=autolang.trans("ok")+"</button>";    
    html+="</div>";
  } else {  
    if (rules[3]) {
      prefill=JSON.parse(JSON.stringify(prefill));
      prefill=_.extend(prefill,rules[3]);
    }  
    html="<div class='wizardinner'>";
    html+=rules[0]+"<p>";
    //html+=JSON.stringify(prefill);
    if (rules[2]=="boolean") {
      v1=JSON.parse(JSON.stringify(prefill));
      v1[rules[1]]=true;
      v2=JSON.parse(JSON.stringify(prefill));
      v2[rules[1]]=false;
      case1='automodals.replaceWizardHtml('+JSON.stringify(rules[4])+', ';
      case1+=JSON.stringify(v1)+')';
      case2='automodals.replaceWizardHtml('+JSON.stringify(rules[5])+', ';
      case2+=JSON.stringify(v2)+')';
      html+="<button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("yes")+"</button>";
      html+=" ";
      html+="<button onclick='"+case2+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("no")+"</button>";      
    } else if (rules[2] && rules[2].startsWith("ref:")) {
      v1=JSON.stringify(prefill);
      case1='automodals.useWizardSelection('+JSON.stringify(rules[1])+', ';
      case1+=JSON.stringify(rules[4])+', ';
      case1+=v1+');';
      html+="<button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("ok")+"</button>";
      html+="<span id='wizardReactSwitch' style='display: none'>";
      html+=JSON.stringify([rules[1],rules[2]]);
      html+="</span>";
    } else {
      v1=JSON.stringify(prefill);
      case1='automodals.replaceWizardHtml('+JSON.stringify(rules[4])+', ';
      tmp='automodals.wizardGetValue('+v1+',"'+rules[1]+'")';
      case1=case1+tmp+");";
      html+="<input type='text' class='fldinput' name='"+rules[1]+"'";
      html+=" id='wizard_"+rules[1]+"' >";
      html+="<br><button onclick='"+case1+"' class='btn btn-primary btn-sm trans'>";
      html+=autolang.trans("ok")+"</button>";            
    }  
    html+="</div>";
  }  
  return html;
}


function tmptst(x) {
  console.log("tmptst");
  console.log(x);
}

function wizardGetValue(prefill,varname) {
  var tmp,v;
  v=JSON.parse(JSON.stringify(prefill));
  tmp=$("#wizard_"+varname).val();
  if (!tmp) {
    var err=autolang.trans("Please enter value");
    $("#wizardModalErr").html(err);
    return null;
  }  
  v[varname]=tmp;
  return v;
}

function replaceWizardHtml(rules,prefill) {
  var show=makeWizardHtml(rules,prefill);
  var err=autolang.trans("Please enter value");
  if (show!==null) {
    $("#wizardModalErr").html("");
    $("#wizardModalDescription").html(show);  
    makeWizardReact();
  } else {
    $("#wizardModalErr").html(err);
  }    
}

var wizardReactElement=null;

function makeWizardReact() {
  var inputs,viewname,fldname,viewdef;
  if (document.getElementById('wizardModalReact').innerHtml!=="" &&
      document.getElementById('wizardReactSwitch') &&
      $("#wizardReactSwitch").html()!=="") {
    inputs=$("#wizardReactSwitch").html();
    inputs=JSON.parse(inputs); 
    fldname=inputs[0];        
    viewname=inputs[1];
    if (!viewname || !viewname.startsWith("ref:")) return;
    viewname=viewname.substr(4);        
    console.log(fldname);
    console.log(viewname);
    if (wizardReactElement) {
      ReactDOM.unmountComponentAtNode(document.getElementById('wizardModalReact'));
      wizardReactElement=null;
    }          
    viewdef=_.findWhere(globalState.viewdefs, {"name":viewname});
    wizardReactElement=React.createElement(autofldsrch.AutoEditFldSearch,{
             handleChange:tmptst,             
             value:"",
             viewdef:viewdef,
             name:fldname, 
             "data-filter": "value",
             show: "searchfield",       
             searchValue:""});     
    ReactDOM.render(wizardReactElement, document.getElementById('wizardModalReact'));
  } else {
    if (wizardReactElement) {
      ReactDOM.unmountComponentAtNode(document.getElementById('wizardModalReact'));
      wizardReactElement=null;
    } 
  }    
}

function useWizardSelection(mainfld,next,vals) {
  var rfieldsel,tmp,v;
  rfieldsel="#wizardModalReact"+" input[name='"+mainfld+"']";
  tmp=$(rfieldsel).val();
  if (tmp) {
    $("#wizard_"+mainfld).val(tmp);
  }
  if (!tmp) {
    var err=autolang.trans("Please enter value");
    $("#wizardModalErr").html(err);
    return null;
  }  
  v=JSON.parse(JSON.stringify(vals));
  v[mainfld]=tmp;
  automodals.replaceWizardHtml(next,v);
}


/* -------- import -------- */

function showImportModal() {
  $("#importModalOK").hide();
  $("#importModalImport").show();
  $("#importModalCancel").show();
  $("#importModalResult").html("");
  $("#importModalValue").val("");
  $("#importModalFile").val("");
  $('#importModal').modal('show');
}

function showImportModalResult(txt) {
  $("#importModalResult").html(txt);
  $("#importModalOK").show();
  $("#importModalImport").hide();
  $("#importModalCancel").hide();
}

function sendImportModal() {
  var val,parsed;
  val=$("#importModalValue").val();
  if (!val) {
    showImportModalResult(autolang.trans("Please select a proper file"));
    return;
  }
  try {
    parsed=JSON.parse(val);
  } catch (e) {
    showImportModalResult(autolang.trans("File does not contain correct json"));
    return;
  }  
  autoapi.postImport(parsed);
}

function importFileChange(e) {
  var input=e.target; 
  if (!input.files || input.files.length<1) return;
  var file = input.files[0];
  var filecontent="";        
  var reader = new FileReader();
  reader.onload = function(out){
    importFileChangeFinal(input,input.value,out.target.result);
  }    
  reader.readAsText(file);
}
  
function importFileChangeFinal(input,value,result) {
  $("#importModalValue").val(result);
  $("#importModalImport").show();
}  

// ====== exported functions =========

export {
  getModalHelpLengthLimit, 

  modalGetValue,
  modalConfirm,
  modalWizard,
  replaceWizardHtml,
  wizardGetValue,
  useWizardSelection,

  showImportModal,
  showImportModalResult,
  sendImportModal,
  importFileChange,
  importFileChangeFinal
};
  
