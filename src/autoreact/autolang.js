/* 
 
 Language translation utils
 
 uses globalState.lang for language selection
 default: first language in lists

*/

import * as autoutils from './autoutils.js';


// ====== module start =========

// ====== exported functions =========

// normal ui translation function

function trans(s) {
  return transFrom(transTable,globalState.lang,s);
}

// translate field names from data

function fldtrans(s) {
  return transFrom(fldtransTable,globalState.lang,s);
}

// select lang-corresponding el from list

function langelem(lst) {
  var langnr=getLangNr(); 
  if (!lst) return "";
  
  if (_.isArray(lst)) {
    if (langnr<lst.length) return lst[langnr];
    else return lst[0];
  } else if (_.isObject(lst)) {
    if (lst[globalState.lang]) return lst[globalState.lang];
    else return s;
  } else {
    return transFrom(fldtransTable,globalState.lang,lst);
  }  
}

// initially trans ui parts determined by the selectors list

function initialTrans() {
  var x,y;
  var selectors=[".trans","button"];
  for (x=0; x<selectors.length; x++) {
    if (selectors[x].startsWith("#")) {
      $(selectors[x]).html(exports.trans($(selectors[x]).html()));
    } else { 
      $(selectors[x]).each(function(i) {
        //autoutils.debug( index + ": " + $( this ).text() );
        if ($(this).attr("data-label")) y=exports.trans($(this).attr("data-label"));
        else y=trans($(this).html());
        $(this).html(y);
      });
    }       
  }
}

// ========== local functions =======

function getLangNr() {
  if (_.has(globalState,"lang") && _.has(langNr,globalState.lang)) 
    return langNr[globalState.lang];
  else 
    return 0;
}

function transFrom(transdata,lang,s) {
  var langnr=getLangNr();
  var lst=transdata[s];
  if (!lang) return s;
  if (!lst) return s;
  if (_.isArray(lst)) {
    if (langnr<lst.length) return lst[langnr];
    else return lst[0];
  } else if (_.isObject(lst)) {
    if (lst[globalState.lang]) return lst[globalState.lang];
    else return s;
  } else return s;
}

// ========== data =======

// map language name to number in translation list

var langNr = {
  "eng": 0,
  "est": 1
};

// general ui label translations

var transTable={
  
//'list': ["list","loetelu"],
'list': {"eng":"list","est":"loetelu"}, // example alternative
'view': ["view","vaata"],
'edit': ["edit","muuda"],
'add': ["add","lisa"],  

'est_switch': ["English","English"],
'eng_switch': ["Estonian","Eesti"],
'English': ["English","Inglise"],
'Estonian': ["Estonian","Eesti"],
'Help': ["Help","Abi"], 
  
'Resources': ["Resources","Ressursid"],
  
'Close': ["Close","Sulge"],
'Search': ["Search","Otsi"],
'search': ["search","otsi"],
'Open extended search': ["Open extended search","Ava laiendatud otsing"],
'Close extended search': ["Close extended search","Sulge laiendatud otsing"],
'SEARCH': ["SEARCH","OTSI"],
'Export': ["Export","Ekspordi"],
'Save': ["Save","Salvesta"],  
'Edit': ["Edit","Muuda"],   
'View also empty fields': ["View also empty fields","Vaata ka täitmata välju"],
'Hide empty fields': ["Hide empty fields","Peida täitmata väljad"],
'Cancel': ["Cancel","Katkesta"], 
'Delete': ["Delete","Kustuta"],
'Export data': ["Export data","Ekspordi andmed"],
'Import data': ["Import data","Impordi andmed"],
'Import': ["Import","Import"],
'Add': ["Add","Lisa"], 
'Open document': ["Open document","Ava dokument"], 
'search text': ["search text","otsingutekst"],  
'Delete the item?' : ["Delete the item?","Kustuta see rida?"],
'Delete the system from RIHA' : ["Delete the system from RIHA","Kustuta süsteem RIHAst"],
'click': ["click","kliki"], 
'add element': ["add element","lisa element"],
'Please fill all fields marked with *': ["Please fill all fields marked with *","Palun täida kõik tärniga märgitud väljad"],
'code' : ["code","kood"],
'search name' :["search name","otsi nime"],

'First': ["First","Esimene"],
'Previous': ["Previous","Eelmine"],
'Next': ["Next","Järgmine"],
'Last': ["Last","Viimane"],
'Show all': ["Show all","Näita kõiki"],
'Altogether': ["Altogether","Kokku"],
'altogether': ["altogether","kokku"],
'count': ["count","kokku"],
'rows': ["rows","read"],
'no data': ["no data","andmeid ei leitud"],
'loading data': ["loading data","andmeid laetakse"],
'version': ["version","versioon"],
  
'yes': ["yes","jah"], 
'no': ["no","ei"], 
'true': ["yes","jah"], 
'false': ["no","ei"],  

'Saved': ["Saved","Salvestatud"],
'Connection error': ["Connection error","Ühenduse viga"],
'Error saving': ["Error saving","Viga salvestamisel"],
'Error deleting': ["Error deleting","Viga kustutamisel"],
'Error': ["Error","Viga"],  
'Error: timeout': ["Error: timeout", "Viga: ei jõudnud vastust ära oodata"],
'Not implemented': ["Not implemented","Ei ole realiseeritud",],
'description'  : ["description","kirjeldus"],
'wrong count'  : ["wrong count","vigane koguarv"],
'File must contain json data in a proper form.': 
  ['File must contain json data in a proper form.','Fail peab sisaldama õigel kujul json teksti.'],
'Please select a file and then press Import.': 
  ['Please select a file and then press Import.','Palun vali fail ja siis vajuta Import.'],
'Import was successful'  : ["Import was successful","Import oli edukas"],
'Please select a proper file' : ['Please select a proper file','Palun vali sobiv fail'],
'File does not contain correct json': ['File does not contain correct json','Fail ei sisalda korrektset json teksti'],
'Main data': ["Main data","Üldandmed"],

'documents': ["Documents","Dokumendid"],
'Reports': ["Reports","Raportid"],
'Help &nbsp;&dtrif;': ["Help &nbsp;&dtrif;","Juhendid &nbsp;&dtrif;"],

'Object': ["Object","Objekt"],
'Input': ["Input","Sisesta"],
'Confirm': ["Confirm","Kinnita"],
'Wizard': ["Wizard","Lisamise algusetapp"],

'What is this?': ["What is this?","Mis siin on?"],

'Please save main data first': ["Please save main data first","Palun salvesta kõigepealt üldandmed"],
'Please enter value': ["Please enter value","Palun täida väli"]    
}

// data field translations

var fldtransTable={
'Resources': ["Resources","Ressurss"],   
'Author': ["Author","Autor"], 
'Text': ["Text","Tekst"],
'Evaluated': ["Evaluated","Hinnatud"],
'Date': ["Date","Kuupäev"],  
'Created': ["Created","Loodud"],   
'en': ["English","Inglise"],
'et': ["Estonian","Eesti"], 
'type': ["type","tüüp"],
'organization': ["organization", "organisatsioon"],
'lang': ["lang","keel"],  
  
'description': ["description","kirjeldus"],
'name': ["name","nimi"],  
'person': ["person","isik"], 
'date_from': ["date from","alates"], 
'date_to': ["date to","kuni"], 
'role': ["role","roll"],
'short_name': ["Short_name","Lühinimi"],

'users': ["users","kasutajad"]
                                      
}

// ====== module end ==========


export {
  trans,
  fldtrans,
  langelem,
  initialTrans
}  
