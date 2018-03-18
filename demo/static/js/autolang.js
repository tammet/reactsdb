/* 
 
 RIHA
 
 Language translation utils
 
 uses globalState.lang for language selection
 default: first language in lists

*/
    
(function(exports) {
  "use strict";
  
// ====== module start =========

// ====== exported functions =========

// normal ui translation function

exports.trans = function(s) {
  return transFrom(transTable,globalState.lang,s);
}

// translate field names from data

exports.fldtrans = function(s) {
  return transFrom(fldtransTable,globalState.lang,s);
}

// select lang-corresponding el from list

exports.langelem = function(lst) {
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

exports.initialTrans = function() {
  var x,y;
  var selectors=[".trans","button"];
  for (x=0; x<selectors.length; x++) {
    if (selectors[x].startsWith("#")) {
      $(selectors[x]).html(exports.trans($(selectors[x]).html()));
    } else { 
      $(selectors[x]).each(function(i) {
        //autoutils.debug( index + ": " + $( this ).text() );
        if ($(this).attr("data-label")) y=exports.trans($(this).attr("data-label"));
        else y=exports.trans($(this).html());
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
'Add': ["Add","Lisa"], 
'Open document': ["Open document","Ava dokument"], 
'search text': ["search text","otsingutekst"],  
'Delete the item?' : ["Delete the item?","Kustuta see rida?"],
'Delete the system from RIHA' : ["Delete the system from RIHA","Kustuta süsteem RIHAst"],
'click': ["click","kliki"], 
'add element': ["add element","lisa element"],
'Please fill all fields marked with *': ["Please fill all fields marked with *","Palun täida kõik tärniga märgitud väljad"],
'Create a new version':["Create a new version","Loo uus versioon"],
'Create a new version?':["Create a new version?","Loo uus versioon?"],
'Submit to approval':["Submit to approval","Saada kooskõlastamisele"],
'Submit to approval?':["Submit to approval?","Saada kooskõlastamisele?"],
'Submitted to approval':["Submitted to approval","Saadetud kooskõlastamisele"],
'in approval':["in approval","kooskõlastamisel"],
'New version name or number':["New version name or number","Uue versiooni nimi või number"],
'New version created':["New version created","Uus versioon loodud"],
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

'Main data': ["Main data","Üldandmed"],

'INFOSYSTEMS': ["INFOSYSTEMS","INFOSÜSTEEMID"],
'ORGANIZATIONS': ["ORGANIZATIONS","ASUTUSED"],
'SERVICES': ["SERVICES","TEENUSED"],
'CLASSIFIERS': ["CLASSIFIERS","KLASSIFIKAATORID"],
'XML ASSETS': ["XML ASSETS","XML VARAD"],
'MORE...': ["MORE...","VEEL..."],
'EXIT': ["EXIT","VÄLJU"],
'CLASSIF': ["CLASSIF","KLASSIF"],
'DATA': ["DATA","ANDMED"],
'AREA': ["AREA","VALDK"],


'infosystem': ["infosystem","infosüsteem"],
'service': ["service","teenus"],
'xml asset': ["xml asset","xml vara"],
'xmlasset': ["xml asset","xml vara"],
'classifier': ["classifier","klassifikaator"],
'document': ["document","dokument"],

'infosystems': ["Infosystems","Infosüsteemid"],
'services': ["Services","Teenused"],
'areas': ["Area","Valdkonnad"],
'entitys': ['Entities', 'Andmeobjektid'],
'xmlassets': ["Xml assets","XML varad"],
'classifiers': ["Classifiers","Klassifikaatorid"],
'searchs' : ["Search", "Otsing"],
'infosystem_dataObjectss': ["Entities","Andmeobjektid"],

'documents': ["Documents","Dokumendid"],

'Reports': ["Reports","Raportid"],
'Help &nbsp;&dtrif;': ["Help &nbsp;&dtrif;","Juhendid &nbsp;&dtrif;"],
'Reports &nbsp;&dtrif;': ["Reports &nbsp;&dtrif;","Aruanded &nbsp;&dtrif;"],
'Extended search': ["Extended search","Laiendatud otsing"],
'Universal search': ["Universal search","Üldotsing"],
'Unisearch': ["Unisearch","Üldotsing"],

'Object': ["Object","Objekt"],
'Input': ["Input","Sisesta"],
'Confirm': ["Confirm","Kinnita"],
'Wizard': ["Wizard","Lisamise algusetapp"],
'name' :["name","nimi"],

'users': ["users","kasutajad"],
'main': ["main","põhiandmed"],

'What is this?': ["What is this?","Mis siin on?"],

'link to external system: not implemented':["link to external system: not implemented",
                                            "link välisele süsteemile ei ole hetkel kasutuses"],
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
'occupation': ["occupation","amet"], 
'contact_level': ["contact level","kontaktitase"], 
'role': ["role","roll"],

'short_name': ["Short_name","Lühinimi"],

'iske_audit_status': ["status","staatus"],
'iske_audit_date': ["date","kuupäev"],
'iske_audit_deadline': ["deadline","tähtaeg"],
'document': ["document",""],

'users': ["users","kasutajad"],
'main': ["main","põhiandmed"],

'link to external system: not implemented':["link to external system: not implemented",
                                            "link välisele süsteemile ei ole hetkel kasutuses"]

}

// ====== module end ==========

})(typeof exports === 'undefined'? this.autolang = {} : exports);

