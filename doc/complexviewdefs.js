(function(exports) {

var viewdefs =
[
   {
      "name" : "organization", // as used by code
      "label" : "Asutused", // shown to users, optional
      "object" : "organization",  // ??
      "table" : "asutused.asutus", // where to search from, optional
      "key" : "asutus_id", // primary key by which records are identified
      "refField" : "registrikood", 
      "nameField" : "nimetus",
      "refTemplate" : "ref:organization",
      "fields" : [ // all fields used in some way
         {
            "name" : "registrikood", // as used by code
            "label" : "Regnr", // show to users, optional
            "type" : "string", /* type: 
                either simple: string, integer, boolean, date
                array of simple, example: array:string
                array of other views, example: linked_infosystem
                reference to other view, example: ref:infosystem
           */
            "order" : 2, // order of field shown, there may be gaps, optional (if missing, use actual order in list)           
            "filter" : false, // put on the table filter above or not
            "listShow" : false, // show field on the list view or not
            "help" : "Asutuse registrikood" // optional help
         },
         {
            "name" : "nimetus",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Asutuse nimi"
         }
      ]
   },
   {
      "name" : "infosystem",
      "label" : "Infosüsteemid",
      "object" : "infosystem",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:infosystem",
      "approve" : true,
      "menu" : [ // submenu for this view
         {
            "name" : "general",
            "label" : "Üldandmed",
            "template" : "infosystem",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem",
            "addWizard" : [ // menu uses a wizard for creating an object
               "Kas soovid kasutada infosüsteemi tekitamiseks viisardi abi? Vastates \"jah\" avaneb viisard, vastates \"ei\" saab liikuda kohe infosüsteemi lisamise lehele",
               "uses_standard_solution",
               "boolean",
               null,
               [
                  "Kas see infosüsteem baseerub standardlahendusel? Standardlahendus on varem valmistehtud rakendus (dokumendihaldus, lemmikloomade register vms) mida see infosüsteem lihtsalt kohandab.",
                  "uses_standard_solution",
                  "boolean",
                  {
                     "infosystem_status" : "asutamine_sisestamisel"
                  },
                  [
                     "Otsi infosüsteemi poolt kasutatav standardlahendus",
                     "standard_solution",
                     "ref:infosystem",
                     null,
                     [
                        "Sisesta palun infosüsteemi täisnimi. Pärast saad lisaks sisestada lühinime.",
                        "name",
                        "string",
                        null,
                        [
                           "Sisesta palun infosüsteemi unikaalne identifikaator. Kasuta selleks kas infosüsteemi veebi-urli või mõtle välja suvaline tekstiline tehniline nimi, mis võiks soovitavalt alata prefiksiga \"urn:\" Seda identifikaatorit kasutatakse edaspidi (ainult) tehnilistes viidetes. ",
                           "uri",
                           "string",
                           null,
                           true
                        ]
                     ]
                  ],
                  [
                     "Sisesta palun infosüsteemi täisnimi. Pärast saad lisaks sisestada lühinime.",
                     "name",
                     "string",
                     null,
                     [
                        "Sisesta palun infosüsteemi unikaalne identifikaator. Kasuta selleks kas infosüsteemi veebi-urli või mõtle välja suvaline tekstiline tehniline nimi, mis võiks soovitavalt alata prefiksiga \"urn:\" Seda identifikaatorit kasutatakse edaspidi (ainult) tehnilistes viidetes. ",
                        "uri",
                        "string",
                        null,
                        true
                     ]
                  ]
               ],
               true
            ]
         },
         {
            "name" : "sourceDocuments",
            "label" : "Alusdokumendid",
            "template" : "infosystem_sourceDocuments",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_sourceDocuments",
            "restriction" : "main_resource_id={main_resource_id}&kind=infosystem_source_document" // creates additional clause for sql where
         },
         {
            "name" : "documents",
            "label" : "Lisadokumendid",
            "template" : "infosystem_documents",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_documents",
            "restriction" : "main_resource_id={main_resource_id}&kind=document"
         },
         {
            "name" : "functions",
            "label" : "Funktsioonid",
            "template" : "infosystem_functions",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_functions",
            "restriction" : "main_resource_id={main_resource_id}&kind=function"
         },
         {
            "name" : "dataObjects",
            "label" : "Andmeobjektid",
            "template" : "infosystem_dataObjects",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_dataObjects",
            "restriction" : "main_resource_id={main_resource_id}&kind=entity"
         },
         {
            "name" : "dataObjectsList",
            "label" : "Andmete loetelu",
            "template" : "infosystem_dataObjectsList",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_dataObjectsList",
            "restriction" : "main_resource_id={main_resource_id}&kind=entity",
            "edit" : false // if false, not an editabe field
         },
         {
            "name" : "services",
            "label" : "Teenused",
            "template" : "infosystem_services",
            "viewmenu" : "infosystem",
            "viewname" : "infosystem_services",
            "restriction" : "main_resource_parent_id={main_resource_id}&kind=service"
         },
         {
            "name" : "approval",
            "label" : "Kooskõlastamine",
            "viewmenu" : "infosystem",
            "url" : "/riha/main/approvals"
         }
      ],
      "groups" : [  // how to split a record view into field groups
         {
            "name" : "main",
            "label" : "Põhiandmed"
         },
         {
            "name" : "contacts",
            "label" : "Töötlejad/kontaktid"
         },
         {
            "name" : "spatial",
            "label" : "Ruumiandmed"
         },
         {
            "name" : "serviceLevel",
            "label" : "Teenustase"
         },
         {
            "name" : "questionnaire",
            "label" : "Koosvõime"
         },
         {
            "name" : "classifiers",
            "label" : "Klassifik."
         }
      ],
      "groupMenu" : "tabs", // if so, field groups are shown as a tabbed pane         
      "addWizard" : [
         "Kas soovid kasutada infosüsteemi tekitamiseks viisardi abi? Vastates \"jah\" avaneb viisard, vastates \"ei\" saab liikuda kohe infosüsteemi lisamise lehele",
         "uses_standard_solution",
         "boolean",
         null,
         [
            "Kas see infosüsteem baseerub standardlahendusel? Standardlahendus on varem valmistehtud rakendus (dokumendihaldus, lemmikloomade register vms) mida see infosüsteem lihtsalt kohandab.",
            "uses_standard_solution",
            "boolean",
            {
               "infosystem_status" : "asutamine_sisestamisel"
            },
            [
               "Otsi infosüsteemi poolt kasutatav standardlahendus",
               "standard_solution",
               "ref:infosystem",
               null,
               [
                  "Sisesta palun infosüsteemi täisnimi. Pärast saad lisaks sisestada lühinime.",
                  "name",
                  "string",
                  null,
                  [
                     "Sisesta palun infosüsteemi unikaalne identifikaator. Kasuta selleks kas infosüsteemi veebi-urli või mõtle välja suvaline tekstiline tehniline nimi, mis võiks soovitavalt alata prefiksiga \"urn:\" Seda identifikaatorit kasutatakse edaspidi (ainult) tehnilistes viidetes. ",
                     "uri",
                     "string",
                     null,
                     true
                  ]
               ]
            ],
            [
               "Sisesta palun infosüsteemi täisnimi. Pärast saad lisaks sisestada lühinime.",
               "name",
               "string",
               null,
               [
                  "Sisesta palun infosüsteemi unikaalne identifikaator. Kasuta selleks kas infosüsteemi veebi-urli või mõtle välja suvaline tekstiline tehniline nimi, mis võiks soovitavalt alata prefiksiga \"urn:\" Seda identifikaatorit kasutatakse edaspidi (ainult) tehnilistes viidetes. ",
                  "uri",
                  "string",
                  null,
                  true
               ]
            ]
         ],
         true
      ],
      "fields" : [
         {
            "name" : "uri",
            "label" : "Unikaalne identifikaator",
            "type" : "string",
            "group" : "main",
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi unikaalne URI, mis on kasutaja määrata",
            "mustFill" : true
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Infosüsteemi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "group" : "main",
            "order" : 2,
            "listShow" : false,
            "help" : "Infosüsteemi lühinimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "group" : "main",
            "order" : 3,
            "listShow" : true,
            "help" : "Infosüsteemi omaniku registrikood",
            "mustFill" : true
         },
         {
            "name" : "version",
            "label" : "Versioon",
            "type" : "string",
            "group" : "main",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "inimloetav versiooni nr, ei kasutata identifikaatorina",
            "editShow" : false,
            "addShow" : true
         },
         {
            "name" : "access_restriction",
            "label" : "Juurdepääsupiirang",
            "type" : "integer",
            "group" : "main",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "RIHAsse sisestatavad infosüsteemi andmed sisaldavad juurdepääsupiiranguga teavet",
            "values" : [
               [
                  "0",
                  "Juurdepääsupiirang puudub"
               ],
               [
                  "1",
                  "Andmeid näevad autenditud kasutajad"
               ],
               [
                  "2",
                  "Andmeid näevad ainult vaatamisõiguse saanud isikud"
               ]
            ]
         },
         {
            "name" : "infosystem_status",
            "label" : "Olek",
            "type" : "string",
            "group" : "main",
            "order" : 5,
            "listShow" : true,
            "help" : "Infosüsteemi olek",
            "values" : [
               [
                  "ei_asutata",
                  "Ei asutata"
               ],
               [
                  "asutamine_sisestamisel",
                  "Asutamine sisestamisel"
               ],
               [
                  "asutamine_kooskolastamisel",
                  "Asutamine kooskõlastamisel"
               ],
               [
                  "asutamine_kooskolastatud",
                  "Asutamine kooskõlastatud"
               ],
               [
                  "kasutusele_votmise_kooskolastamisel",
                  "Kasutusele võtmine kooskõlastamisel"
               ],
               [
                  "kasutusele_votmise_registreerimisel",
                  "Kasutusele võtmine registreerimisel"
               ],
               [
                  "kasutusel",
                  "Kasutusel"
               ],
               [
                  "lopetamise_kooskolastamisel",
                  "Lõpetamine kooskõlastamisel"
               ],
               [
                  "lopetamise_registreerimisel",
                  "Lõpetamine registreerimisel"
               ],
               [
                  "lopetatud",
                  "Lõpetatud"
               ]
            ]
         },
         {
            "name" : "url",
            "label" : "Avalik veebiaadress",
            "type" : "string",
            "group" : "main",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi asukoht internetis (URL)",
            "editWidget" : "url"
         },
         {
            "name" : "purpose",
            "label" : "Infosüsteemi eesmärk",
            "type" : "string",
            "group" : "main",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi asutamise eesmärk"
         },
         {
            "name" : "uses_standard_solution",
            "label" : "Kasutab standardlahendust",
            "type" : "boolean",
            "group" : "main",
            "order" : 8,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas infosüsteem baseerub standardinfosüsteemil"
         },
         {
            "name" : "standard_solution",
            "label" : "Standardlahendus",
            "type" : "ref:infosystem",
            "group" : "main",
            "order" : 9,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Aluseks olev standardinfosüsteem",
            "showOnlyWhen" : {
               "uses_standard_solution" : "true"
            },
            "restriction" : "is_standard_solution=true"
         },
         {
            "name" : "is_standard_solution",
            "label" : "On standardlahendus",
            "type" : "boolean",
            "group" : "main",
            "order" : 10,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas tegemist on standardinfosüsteemiga",
            "showOnlyWhen" : {
               "uses_standard_solution" : "false"
            }
         },
         {
            "name" : "linked_infosystems",
            "label" : "Seosed teiste infosüsteemidega",
            "type" : "array:linked_infosystem",
            "group" : "main",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Seosed teiste infosüsteemidega"
         },
         {
            "name" : "formation_date",
            "label" : "Asutamise kuupäev",
            "type" : "date",
            "group" : "main",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi asutamise kuupäev"
         },
         {
            "name" : "take_into_use_date",
            "label" : "Kasutusele võtmise kuupäev",
            "type" : "date",
            "group" : "main",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi kasutusele võtmise kuupäev"
         },
         {
            "name" : "uses_xroad",
            "label" : "Liidestatakse X-teega",
            "type" : "boolean",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "help" : "Kas liidestatakse X-teega"
         },
         {
            "name" : "xroad_join_date",
            "label" : "X-teega liitumise kuupäev",
            "type" : "date",
            "group" : "main",
            "order" : 15,
            "listShow" : false,
            "help" : "X-teega liitumise kuupäev",
            "showOnlyWhen" : {
               "uses_xroad" : "true"
            }
         },
         {
            "name" : "personal_data",
            "label" : "Töödeldakse isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 16,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas sisaldab isikuandmeid?"
         },
         {
            "name" : "sensitive_personal_data",
            "label" : "Töödeldakse delikaatseid isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 17,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas sisaldab delikaatseid isikuandmeid?"
         },
         {
            "name" : "infosystem_type",
            "label" : "Liik",
            "type" : "string",
            "group" : "main",
            "order" : 18,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Infosüsteemi tüüp",
            "values" : [
               [
                  "jaatmevaldajad",
                  "Jäätmevaldajad"
               ],
               [
                  "kindlustav_systeem",
                  "Kindlustav süsteem"
               ],
               [
                  "veebisysteem",
                  "Veebisysteem"
               ],
               [
                  "misp",
                  "MISP"
               ],
               [
                  "finants_raamatupidamine",
                  "Finants/raamatupidamine"
               ],
               [
                  "dokumendihaldus",
                  "Dokumendihaldus"
               ],
               [
                  "personalisysteem",
                  "Personalisüsteem"
               ],
               [
                  "muu",
                  "Muu"
               ]
            ]
         },
         {
            "name" : "groups",
            "label" : "Grupp",
            "type" : "array:string",
            "group" : "main",
            "order" : 19,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi grupid",
            "values" : [
               [
                  "INFOSYSTEEM_GRUPP_MAJANDUSMINISTEERIUM",
                  "Majandusministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_VALISMINISTEERIUM",
                  "Välisministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_X_TEEGA_LIITUNUD",
                  "X-teega liitunud"
               ],
               [
                  "INFOSYSTEEM_GRUPP_HARIDUSMINISTEERIUM",
                  "Haridusministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_KESKKONNAMINISTEERIUM",
                  "Keskkonnaministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_ERASEKTOR",
                  "Erasektor"
               ],
               [
                  "INFOSYSTEEM_GRUPP_RAHANDUSMINISTEERIUM",
                  "Rahandusministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_KAITSEMINISTEERIUM",
                  "Kaitseministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_POLLUMAJANDUSMINISTEERIUM",
                  "Põllumajandusministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_SISEMINISTEERIUM",
                  "Siseministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_SOTSIAALMINISTEERIUM",
                  "Sotsiaalministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_KOHALIKUD_OMAVALITSUSED",
                  "Kohalikud omavalitsused"
               ],
               [
                  "INFOSYSTEEM_GRUPP_KULTUURIMINISTEERIUM",
                  "Kultuuriministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_JUSTIITMINISTEERIUM",
                  "Justiitministeerium"
               ],
               [
                  "INFOSYSTEEM_GRUPP_MUUD",
                  "Muud"
               ]
            ]
         },
         {
            "name" : "older_data",
            "label" : "Mis ajast on kõige vanemad andmed kogutud",
            "type" : "number",
            "group" : "main",
            "order" : 20,
            "filter" : false,
            "listShow" : false,
            "help" : "Vanimate andmete aeg, aastaarv (mis ajast on kõige vanemad andmed kogutud)"
         },
         {
            "name" : "data_retention_period_eternal",
            "label" : "Alaline andmete säilitamisaeg",
            "type" : "boolean",
            "group" : "main",
            "order" : 21,
            "filter" : false,
            "listShow" : false,
            "help" : "Kas andmete säilitamisaeg on alaline?"
         },
         {
            "name" : "manner_of_archive_keeping",
            "label" : "Arhiivi pidamise viis",
            "type" : "string",
            "group" : "main",
            "order" : 22,
            "filter" : false,
            "listShow" : false,
            "help" : "Arhiivi pidamise viis",
            "values" : [
               [
                  "elektrooniline",
                  "Elektrooniline"
               ],
               [
                  "paberil",
                  "Paberil"
               ],
               [
                  "elektrooniline_ja_paberil",
                  "Elektrooniline ja paberil"
               ]
            ]
         },
         {
            "name" : "differences_from_standard_solution",
            "label" : "Erisused standardlahendusest",
            "type" : "string",
            "group" : "main",
            "order" : 23,
            "filter" : false,
            "listShow" : false,
            "help" : "Erisused standardlahendusest",
            "showOnlyWhen" : {
               "uses_standard_solution" : "true"
            }
         },
         {
            "name" : "iske_security_class_k",
            "label" : "ISKE turvaklass: käideldavus (K)",
            "type" : "string",
            "group" : "main",
            "order" : 24,
            "extfilter" : true,
            "listShow" : false,
            "values" : [
               [
                  "K0",
                  "K0"
               ],
               [
                  "K1",
                  "K1"
               ],
               [
                  "K2",
                  "K2"
               ],
               [
                  "K3",
                  "K3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_t",
            "label" : "ISKE turvaklass: terviklus (T)",
            "type" : null,
            "group" : "main",
            "order" : 25,
            "extfilter" : true,
            "listShow" : false,
            "values" : [
               [
                  "T0",
                  "T0"
               ],
               [
                  "T1",
                  "T1"
               ],
               [
                  "T2",
                  "T2"
               ],
               [
                  "T3",
                  "T3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_s",
            "label" : "ISKE turvaklass: konfidentsiaalsus (S)",
            "type" : null,
            "group" : "main",
            "order" : 26,
            "extfilter" : true,
            "listShow" : false,
            "values" : [
               [
                  "S0",
                  "S0"
               ],
               [
                  "S1",
                  "S1"
               ],
               [
                  "S2",
                  "S2"
               ],
               [
                  "S3",
                  "S3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_l",
            "label" : "ISKE turbeaste",
            "type" : null,
            "group" : "main",
            "order" : 27,
            "extfilter" : true,
            "listShow" : false,
            "values" : [
               [
                  "L",
                  "Madal"
               ],
               [
                  "M",
                  "Keskmine"
               ],
               [
                  "H",
                  "Kõrge"
               ]
            ],
            "editWidget" : "IskeSecurityLevelWidget"
         },
         {
            "name" : "status_of_applying_iske",
            "label" : "ISKE rakendamise staatus",
            "type" : "string",
            "group" : "main",
            "order" : 28,
            "filter" : false,
            "listShow" : false,
            "help" : "ISKE rakendamise staatus",
            "values" : [
               [
                  "kuni_25",
                  "Kuni 25%"
               ],
               [
                  "yle_25",
                  "Üle 25%"
               ],
               [
                  "yle_50",
                  "Üle 50%"
               ],
               [
                  "yle_75",
                  "Üle 75%"
               ],
               [
                  "auditeerimata",
                  "Auditeerimata"
               ],
               [
                  "ei_kuulu",
                  "Ei kuulu auditeerimisele"
               ],
               [
                  "ei_ole_alustatud",
                  "Ei ole alustatud"
               ],
               [
                  "auditit_ei_labinud",
                  "Auditit ei läbinud"
               ],
               [
                  "audit_markustega",
                  "Audit märkustega"
               ],
               [
                  "audit_markusteta",
                  "Audit märkusteta"
               ]
            ]
         },
         {
            "name" : "iske_audit",
            "label" : "ISKE auditite andmed",
            "type" : "array:iske_audit",
            "group" : "main",
            "order" : 29,
            "filter" : false,
            "listShow" : false,
            "help" : "ISKE auditite andmed"
         },
         {
            "name" : "finishing_date",
            "label" : "Lõpetamise kuupäev",
            "type" : "date",
            "group" : "main",
            "order" : 30,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi lõpetamise kuupäev",
            "showOnlyWhen" : {
               "infosystem_status" : [
                  "lopetamise_kooskolastamisel",
                  "lopetamise_registreerimisel",
                  "lopetatud"
               ]
            }
         },
         {
            "name" : "finishing_description",
            "label" : "Lõpetamise kirjeldus",
            "type" : "string",
            "group" : "main",
            "order" : 31,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi lõpetamise kirjeldus",
            "showOnlyWhen" : {
               "infosystem_status" : [
                  "lopetamise_kooskolastamisel",
                  "lopetamise_registreerimisel",
                  "lopetatud"
               ]
            }
         },
         {
            "name" : "classifiers",
            "label" : "Klassifikaatorid",
            "type" : "array:ref:classifier",
            "group" : "classifiers",
            "filter" : false,
            "listShow" : false,
            "help" : "Kasutatavate klassifikaatorite URId"
         },
         {
            "name" : "contact_persons",
            "label" : "Kontaktisikud",
            "type" : "array:linked_person",
            "group" : "contacts",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi kontaktisikute info"
         },
         {
            "name" : "organizations",
            "label" : "Vastutavad ja volitatud töötlejad",
            "type" : "array:linked_organization",
            "group" : "contacts",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi vastutavad ja volitatud töötlejad"
         },
         {
            "name" : "xroad_finishing_date",
            "label" : "X-tee lõpetamise kuupäev",
            "type" : "date",
            "filter" : false,
            "listShow" : false,
            "help" : "X-tee lõpetamise kuupäev"
         },
         {
            "name" : "xroad_finishing_description",
            "label" : "X-tee lõpetamise kirjeldus",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "X-tee lõpetamise kirjeldus"
         },
         {
            "name" : "xroad_sertificate_validity_deadline",
            "label" : "X-tee sertifikaadi kehtivuse lõppkuupäev",
            "type" : "date",
            "filter" : false,
            "listShow" : false,
            "help" : "X-tee sertifikaadi kehtivuse lõppkuupäev"
         },
         {
            "name" : "all_main_data_accessible_through_xroad",
            "label" : "1. x-tee kasutamine andmeteenuste osutamisel",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 51,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu pakub kõiki oma põhiandmeid andmeteenustena andmevahetuskihi (x-tee) kaudu? Alus VV määrus “Infosüsteemide andmevahetuskihi kehtestamine”. Kontrollimeetod: RIHA x-tee andmestik"
         },
         {
            "name" : "all_other_data_loaded_by_xroad",
            "label" : "2. x-tee kasutamine andmeteenuste kasutamisel",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 53,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu saab kõik andmed teistest RIS andmekogudest andmeteenustena andmevahetuskihi (x-tee) kaudu? Kontrollimeetod: andmekogu dokumentatsioonis esitatud loogilise arhitektuuri ülevaatus"
         },
         {
            "name" : "all_public_services_free_for_public_organisations",
            "label" : "3. avalikud teenused on avalikule haldusele tasuta",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 55,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas avalikud teenused (kaasa arvatud sidusteenused) on avaliku halduse asutuste infosüsteemide jaoks tasuta? Kontrollimeetod: kooskõlastusele esitaja kinnitus"
         },
         {
            "name" : "services_use_only_open_standards",
            "label" : "4. avatud standardite kasutamine",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 57,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu välisliidestes kasutatakse ainult avatud standardeid? (nt ruumiandmete korral OGC WMS, WFS jt). Kontrollimeetod: andmekogu dokumentatsioonis esitatud loogilise arhitektuuri ülevaatus"
         },
         {
            "name" : "only_xml_services",
            "label" : "5. XML põhinev andmesüntaks",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 59,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogude välisliidestes kasutatakse XML-i ja XML-il põhinevaid tehnoloogiaid? Kontrollimeetod: andmekogu dokumentatsioonis esitatud loogilise arhitektuuri ülevaatus"
         },
         {
            "name" : "services_have_semantic_descriptions",
            "label" : "6. andmeteenuste semantiline kirjeldus",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 61,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas kõik andmekogu pakutavad andmeteenused on kirjeldatud vastavalt semantika juhisele ? Kontrollimeetod: RIHA-sse esitatud andmeteenuste kirjelduse visuaalne ülevaatus (kas sisaldab SA-WSDL standardi järgi nõutavaid viiteid ontoloogiatele)"
         },
         {
            "name" : "data_structures_have_semantic_descriptions",
            "label" : "7. andmestruktuuride semantiline kirjeldus",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 63,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu andmestruktuur on kirjeldatud vastavalt semantika juhisele ? Kontrollimeetod: RIHA-sse esitatud andmekogu kirjelduse visuaalne ülevaatus (kas sisaldab SA-WSDL standardi järgi nõutavaid viiteid ontoloogiatele)"
         },
         {
            "name" : "contains_required_architecture_description",
            "label" : "8. andmekogu arhitektuuri dokumenteerimine",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 65,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu arhitektuur on dokumenteeritud vähemalt järgmistes vaadetes (arhitektuuridokumendi mall): \n1. talitlusprotsesside, mida andmekogu toetab, vaates\n2. funktsionaalses vaates (nt kasutuslugudena),\n3. loogilises vaates, mis sisaldab minimaalselt andmekogu komponentmudeli ja liideste kirjelduse,\n4. füüsilises vaates, mis sisaldab minimaalselt andmekogu riistvaralise ja baastarkvaralise konfiguratsiooni?\nKontrollimeetod: andmekogu dokumentatsiooni visuaalne ülevaatus"
         },
         {
            "name" : "wcag_usability_level_aa",
            "label" : "9. kasutatavus",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 67,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu esitluskiht, kui kasutatakse veebitehnoloogiaid, vastab WAI soovitusele WCAG v2 tasemele aa või aaa? Kontrollimeetod: automaattestid, visuaalne HTML-i inspekteerimine vastu WCAG nõudeid"
         },
         {
            "name" : "separate_presentation_layer",
            "label" : "10. esitluskihi lahutatus",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 69,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu esitluskiht on äriloogika kihist lahutatud (kasutatakse kihilist arhitektuurimustrit) ja andmevahetus esitluskihi ja äriloogikakihi vahel käib kasutades XML-i või XML-il põhinevaid tehnoloogiaid? Kontrollimeetod: andmekogu dokumentatsioonis esitatud loogilise arhitektuuri ülevaatus"
         },
         {
            "name" : "only_eid_authentication",
            "label" : "12. autentimine ID-kaardiga",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 73,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: kas andmekogu kasutab kasutajate autentimiseks ainult Eesti ID-kaarti ning ei kasutata paroolipõhist ega pankade kaudu autentimist? Kontrollimeetod: kasutus testkeskkonnas"
         },
         {
            "name" : "uses_dvk",
            "label" : "13. dokumendivahetuskeskkond",
            "type" : "boolean",
            "group" : "questionnaire",
            "order" : 75,
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: juhul kui andmekogus käsitletakse teiste asutustega vahetatavaid dokumente - kas andmekogu on liidestatud riigi keskse dokumendivahetuskeskkonnaga? Kontrollimeetod: andmekogu dokumentatsioonis esitatud loogilise arhitektuuri ülevaatus"
         },
         {
            "name" : "all_main_data_accessible_through_xroad_comment",
            "label" : "x-tee kasutamine andmeteenuste osutamisel - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 52,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "all_other_data_loaded_by_xroad_comment",
            "label" : "x-tee kasutamine andmeteenuste kasutamisel - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 54,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "all_public_services_free_for_public_organisations_comment",
            "label" : "avalikud teenused on avalikule haldusele tasuta - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 56,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "services_use_only_open_standards_comment",
            "label" : "avatud standardite kasutamine - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 58,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "only_xml_services_comment",
            "label" : "XML põhinev andmesüntaks - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 60,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "services_have_semantic_descriptions_comment",
            "label" : "andmeteenuste semantiline kirjeldus - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 62,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "data_structures_have_semantic_descriptions_comment",
            "label" : "andmestruktuuride semantiline kirjeldus - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 64,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "contains_required_architecture_description_comment",
            "label" : "andmekogu arhitektuuri dokumenteerimine - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 66,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "wcag_usability_level_aa_comment",
            "label" : "kasutatavus - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 68,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "separate_presentation_layer_comment",
            "label" : "esitluskihi lahutatus - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 70,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "uses_ads_comment",
            "label" : "aadressiandmete süsteem - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 72,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "only_eid_authentication_comment",
            "label" : "autentimine ID-kaardiga - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 74,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "uses_dvk_comment",
            "label" : "dokumendivahetuskeskkond - kommentaar",
            "type" : "string",
            "group" : "questionnaire",
            "order" : 76,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "service_time_24x7",
            "label" : "Tööaeg 24x7",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaeg 24x7"
         },
         {
            "name" : "service_offering_start_time",
            "label" : "Tööaja algus",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise alustamise kellaaeg"
         },
         {
            "name" : "service_offering_end_time",
            "label" : "Tööaja lõpp",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise lõpetamise kellaaeg"
         },
         {
            "name" : "service_time_comments",
            "label" : "Märkused",
            "type" : "string",
            "group" : "serviceLevel",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaja märkused"
         },
         {
            "name" : "incident_initial_response_time",
            "label" : "Intsidentidele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Intsidentidele reageerimise aeg (h)"
         },
         {
            "name" : "service_request_initial_response_time",
            "label" : "Teenuse nõuetele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse nõuetele reageerimise aeg (h)"
         },
         {
            "name" : "service_consultancy_response_time",
            "label" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)"
         },
         {
            "name" : "monthly_average_service_availability",
            "label" : "Kuu keskmine käideldavus (%)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Kuu keskmine käideldavus (%)"
         },
         {
            "name" : "max_duration_of_service_interruption",
            "label" : "Maksimaalne ühekordne katkestuse kestvus (tundi)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 10,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne ühekordne katkestuse kestvus (h)"
         },
         {
            "name" : "acceptable_response_time",
            "label" : "Standardpäringu aeg (s)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Standardpäringu aeg (s)"
         },
         {
            "name" : "monthly_average_service_reliability",
            "label" : "Usaldusväärsus (katkestust/kuus)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Usaldusväärsus (katkestust/kuus)"
         },
         {
            "name" : "service_load_level",
            "label" : "Maksimaalne koormus (kasutajat/minutis)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne koormus (kasutajat/minutis)"
         },
         {
            "name" : "contains_spatial_data",
            "label" : "Kas andmekogu sisaldab ruumiandmeid (nt aadressid, asukoha koordinaadid, kohanimed, topograafilised nähtused?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas andmekogu sisaldab ruumiandmeid (nt aadressid, asukoha koordinaadid, kohanimed, topograafilised nähtused?"
         },
         {
            "name" : "contains_geo_data",
            "label" : "Kas salvestate süsteemis asukoha koordinaate (nt x/y, L/B, ...)? Vt ka Ruumiandmete seadus §3",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas salvestate süsteemis asukoha koordinaate (nt x/y, L/B, ...)? Vt ka Ruumiandmete seadus §3",
            "showOnlyWhen" : {
               "contains_spatial_data" : "true"
            }
         },
         {
            "name" : "geo_system",
            "label" : "Millist geodeetilist süsteemi kasutatakse? (Võib olla mitu)",
            "type" : "array:string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Millist geodeetilist süsteemi kasutatakse? (Võib olla mitu)",
            "showOnlyWhen" : {
               "contains_geo_data" : "true"
            }
         },
         {
            "name" : "main_data_contains_geo_data",
            "label" : "Kas põhiandmed sisaldavad asukoha koordinaate?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas põhiandmed sisaldavad asukoha koordinaate?",
            "showOnlyWhen" : {
               "contains_geo_data" : "true"
            }
         },
         {
            "name" : "geo_meta_data_url",
            "label" : "Ruumiandmekogumi metaandmete URL Eesti Geoportaalis",
            "type" : "array:string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Ruumiandmekogumi metaandmete URL Eesti Geoportaalis",
            "showOnlyWhen" : {
               "main_data_contains_geo_data" : "true"
            }
         },
         {
            "name" : "contains_inspire_data",
            "label" : "Kas infosüsteem sisaldab INSPIRE direktiivi lisades loetletud valdkondade ruumiandmeid?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas infosüsteem sisaldab INSPIRE direktiivi lisades loetletud valdkondade ruumiandmeid?",
            "showOnlyWhen" : {
               "main_data_contains_geo_data" : "true"
            }
         },
         {
            "name" : "contains_address_data",
            "label" : "Kas andmekogus töödeldakse aadressiandmeid?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas andmekogus töödeldakse aadressiandmeid?",
            "showOnlyWhen" : {
               "contains_spatial_data" : "true"
            }
         },
         {
            "name" : "uses_ads_directly",
            "label" : "1. Kas andmekogu on liidestunud ADSiga otse või kaudselt?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "1. Kas andmekogu on liidestunud ADSiga otse või kaudselt?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "infosystems_used_for_address_data",
            "label" : "1.2 Kui andmekogu on liidestunud ADSiga kaudselt, millistest andmekogudest aadressiandmed päritakse?",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "1.2 Kui andmekogu on liidestunud ADSiga kaudselt, millistest andmekogudest aadressiandmed päritakse?",
            "showOnlyWhen" : {
               "uses_ads_directly" : "false"
            }
         },
         {
            "name" : "ads_pk",
            "label" : "2. Millist peavõtit (ADOB_ID, ADS_OID, ADR_ID, koodaadress vms) kasutatakse andmete sidumiseks ADSiga?",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "2. Millist peavõtit (ADOB_ID, ADS_OID, ADR_ID, koodaadress vms) kasutatakse andmete sidumiseks ADSiga?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "ads_link_type",
            "label" : "3. Milliste ADSi andmetega (aadressikomponendiga, aadressiga, aadressiobjektiga vms) salvestatakse seos?",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "3. Milliste ADSi andmetega (aadressikomponendiga, aadressiga, aadressiobjektiga vms) salvestatakse seos?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "stored_ads_data",
            "label" : "4. Millised ADSi andmed salvestatakse lisaks peavõtmele?",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "4. Millised ADSi andmed salvestatakse lisaks peavõtmele?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "ads_regular_update",
            "label" : "5. Kas andmeid hoitakse ajakohasena, st uuendatakse regulaarselt?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "5. Kas andmeid hoitakse ajakohasena, st uuendatakse regulaarselt?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "ads_update_description",
            "label" : "5.1 Kui andmeid ajakohastatakse, siis milliseid X-tee teenuseid ja kui sageli kasutatakse andmete ajakohastamiseks? Kui kasutatakse muid tehnilisi lahendusi peale X-tee teenuste, siis palun kirjeldage neid.",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "5.1 Kui andmeid ajakohastatakse, siis milliseid X-tee teenuseid ja kui sageli kasutatakse andmete ajakohastamiseks? Kui kasutatakse muid tehnilisi lahendusi peale X-tee teenuste, siis palun kirjeldage neid.",
            "showOnlyWhen" : {
               "ads_regular_update" : "true"
            }
         },
         {
            "name" : "ads_history",
            "label" : "6. Kas andmekogus säilitatakse aadresside muutmise ajalugu? Kui säilitatakse, siis palun kirjeldage, kuidas seda tehakse.",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "6. Kas andmekogus säilitatakse aadresside muutmise ajalugu? Kui säilitatakse, siis palun kirjeldage, kuidas seda tehakse.",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "provided_ads_services",
            "label" : "7. Kas andmekogu edastab aadressiandmeid oma teenuste kaudu teistele osapooltele? Kui edastatakse, siis millistele andmekogudele ja millise peavõtmega?",
            "type" : "string",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "7. Kas andmekogu edastab aadressiandmeid oma teenuste kaudu teistele osapooltele? Kui edastatakse, siis millistele andmekogudele ja millise peavõtmega?",
            "showOnlyWhen" : {
               "contains_address_data" : "true"
            }
         },
         {
            "name" : "uses_topo_data",
            "label" : "Kas andmekogus töödeldakse topograafiliste nähtuste ruumiandmeid?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas andmekogus töödeldakse topograafiliste nähtuste ruumiandmeid?",
            "showOnlyWhen" : {
               "contains_spatial_data" : "true"
            }
         },
         {
            "name" : "uses_place_names",
            "label" : "Kas andmekogus töödeldakse kohanimesid?",
            "type" : "boolean",
            "group" : "spatial",
            "filter" : false,
            "listShow" : false,
            "help" : "Küsimus: Kas andmekogus töödeldakse kohanimesid?",
            "showOnlyWhen" : {
               "contains_spatial_data" : "true"
            }
         }
      ]
   },
   {
      "name" : "infosystem_sourceDocuments",
      "label" : "Infosüsteemid",
      "object" : "infosystem_source_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:infosystem_source_document",
      "help" : "Alusdokumendid on süsteemi ametlikud dokumendid (seadused, määrused jms), mis sätestavad süsteemi eesmärgid, piirangud, põhiandmed, loomise ja haldamise korra jms. Süsteemi tehnilised dokumendid, kasutajuhendid jms lisadokumendid siia loetellu ei kuulu.",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "date",
            "order" : 5,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "date",
            "order" : 6,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse lõpp"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "type",
            "label" : "Dokumendi liik",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi liik",
            "values" : [
               [
                  "ristkasutus",
                  "Ristkasutuse alusdokument"
               ],
               [
                  "andmete_esitamise_oigusakt",
                  "Andmete esitamise kohustust fikseeriv õigusakt"
               ],
               [
                  "kontaktandmed_teenuse_kasutamiseks",
                  "Kontaktandmed teenuse kasutamiseks"
               ],
               [
                  "andmekaitse_luba",
                  "Andmekaitse Inspektsiooni luba töödelda delikaatseid isikuandmeid"
               ],
               [
                  "asutuse_asjaamine",
                  "Asjaajamine"
               ],
               [
                  "asutamine",
                  "Infosüsteemi asutamise alusdokument"
               ],
               [
                  "volitatud_tootlejaks_olemine",
                  "Infosüsteemi volitatud töötlejaks olemise alusdokument"
               ],
               [
                  "tasulised_teenused",
                  "Alusdokument tasuliste teenuste kohta"
               ]
            ]
         },
         {
            "name" : "legal_type",
            "label" : "Õigusakti liik",
            "type" : "string",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Õigusakti liik",
            "values" : [
               [
                  "el_oigusakt",
                  "EL õigusakt"
               ],
               [
                  "korraldus",
                  "Korraldus"
               ],
               [
                  "kaskkiri",
                  "Käskkiri"
               ],
               [
                  "leping",
                  "Leping"
               ],
               [
                  "maarus",
                  "Määrus"
               ],
               [
                  "seadus",
                  "Seadus"
               ],
               [
                  "otsus",
                  "Otsus"
               ]
            ]
         },
         {
            "name" : "publishing_info",
            "label" : "Avaldamismärge",
            "type" : "string",
            "order" : 8,
            "filter" : false,
            "listShow" : false
         },
         {
            "name" : "doc_date",
            "label" : "Kuupäev",
            "type" : "date",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kuupäev"
         },
         {
            "name" : "no",
            "label" : "Nr",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi number"
         }
      ]
   },
   {
      "name" : "infosystem_documents",
      "label" : "Infosüsteemid",
      "object" : "document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:document",
      "help" : "Lisadokumendid on kõik juhendid, andmebaasi kirjeldused, tehnoloogia kirjeldused jms mis ei kuulu alus- ehk ametlike dokumentide (seadused, määrused jms) alla.",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Dokumendi kirjeldus",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kirjeldus"
         },
         {
            "name" : "filename",
            "label" : "Failinimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi failinimi",
            "edit" : false
         },
         {
            "name" : "access_restriction",
            "label" : "Juurdepääsupiirang",
            "type" : "integer",
            "filter" : false,
            "listShow" : false,
            "help" : "Juurdepääsupiirang",
            "values" : [
               [
                  "0",
                  "Juurdepääsupiirang puudub"
               ],
               [
                  "1",
                  "Andmeid näevad autenditud kasutajad"
               ],
               [
                  "2",
                  "Andmeid näevad ainult vaatamisõiguse saanud isikud"
               ]
            ]
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "date",
            "order" : 15,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "date",
            "order" : 16,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kehtivuse lõpp"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 21,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "doc_date",
            "label" : "Kuupäev",
            "type" : "date",
            "order" : 14,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kuupäev"
         },
         {
            "name" : "no",
            "label" : "Nr",
            "type" : "string",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi number"
         }
      ]
   },
   {
      "name" : "infosystem_functions",
      "label" : "Infosüsteemid",
      "object" : "function",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:function",
      "help" : "Andmeobjektide säilitamistähtaegade näitamiseks tuleb andmeobjektid jaotada süsteemi suuremate funktsioonide alla, mille jaoks on vaja sätestada erinevad säilitustähtajad. Siin lehel ongi toodud sellised funktsioonid. Süsteemi andmeobjektide juures saab öelda üks/mitu funktsiooni, mis siis määrabki ära andmeobjekti sälitustähtajad: igal üksikul andmeobjektil omaette säilitustähtaega määrata ei ole mõtet.",
      "fields" : [
         {
            "name" : "name",
            "label" : "Funktsiooni/sarja nimi",
            "type" : "string",
            "order" : 2,
            "listShow" : true,
            "help" : "Infosüsteemi funktsiooni nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Kirjeldus"
         },
         {
            "name" : "archival_type",
            "label" : "Arhiiviväärtuse/säilitustähtaja määrang",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "arhiiviväärtuse/säilitustähtaja määrang fikseeritud loeteluna",
            "values" : [
               [
                  "hiljem",
                  "Hiljem"
               ],
               [
                  "jah",
                  "Jah"
               ],
               [
                  "ei",
                  "Ei"
               ]
            ]
         },
         {
            "name" : "retention_period",
            "label" : "Säilitustähtaeg",
            "type" : "number",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Andmeobjekti säilitustähtaeg"
         }
      ]
   },
   {
      "name" : "infosystem_dataObjects",
      "label" : "Infosüsteemid",
      "object" : "entity",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:entity",
      "help" : "Süsteemi andmeobjektid on suuremad abstraktsed objektid (näiteks isik, asutus, klient jms) mis on üldjuhul sätestatud süsteemi põhimääruses. Konkreetsed tehnilised andmeobjektid (tabelid, kirjeväljad jne) ei kuulu siia jaotisse, vaid nad tuleb esitada     eraldi masintöödeldavate lisadokument-failidena või teha võrgust kättesaadavaks.",
      "fields" : [
         {
            "name" : "name",
            "label" : "Andmeobjekti nimetus",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "Andmeobjekti nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Kirjeldus"
         },
         {
            "name" : "semantics",
            "label" : "Valdkonna termin",
            "type" : "array:string",
            "order" : 8,
            "listShow" : false,
            "help" : "terminite tekstiline list, mis esitavad veergude/välja tähendust"
         },
         {
            "name" : "main_data",
            "label" : "Põhiandmed",
            "type" : "boolean",
            "order" : 6,
            "listShow" : true,
            "help" : "Tegemist on andmekogu põhiandmetega"
         },
         {
            "name" : "sensitive_personal_data",
            "label" : "Delikaatsed isikuandmed",
            "type" : "boolean",
            "order" : 5,
            "listShow" : true,
            "help" : "Tegemist on delikaatsete isikuandmetega"
         },
         {
            "name" : "personal_data",
            "label" : "Isikuandmed",
            "type" : "boolean",
            "order" : 4,
            "listShow" : true,
            "help" : "Tegemist on isikuandmetega"
         },
         {
            "name" : "archival_type",
            "label" : "Arhiiviväärtus",
            "type" : "string",
            "order" : 8,
            "listShow" : false,
            "help" : "arhiiviväärtuse/säilitustähtaja määrang fikseeritud loeteluna",
            "values" : [
               [
                  "hiljem",
                  "Hiljem"
               ],
               [
                  "jah",
                  "Jah"
               ],
               [
                  "ei",
                  "Ei"
               ]
            ]
         },
         {
            "name" : "function",
            "label" : "Seotud funktsioon/sari",
            "type" : "ref:function",
            "filter" : false,
            "listShow" : false,
            "help" : "Säilitamisega seotud funktsioonide nimed, mille alla antud andmeobjekt kuulub.",
            "restriction" : "main_resource_id={main_resource_id}"
         },
         {
            "name" : "main_infosystem",
            "label" : "Põhi-infosüsteem",
            "type" : "ref:infosystem",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Kui tegemist ei ole andmekogu põhiandmetega, siis infosüsteemi URI, kust antud atribuut pärit on.",
            "showOnlyWhen" : {
               "main_data" : "false"
            }
         }
      ]
   },
   {
      "name" : "infosystem_dataObjectsList",
      "label" : "Infosüsteemid",
      "object" : "entity",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:entity",
      "help" : "Andmeobjektide list andmekogu alusdokumentidesse tõstmiseks. Vajutage vajadusel (kui list on mitmeks leheküljeks jaotatud) nupule \"Näita kõiki\" ning seejärel Vali ja kopeeri kogu list alsudokumenti kleepimiseks.",
      "edit" : false,
      "fields" : [
         {
            "name" : "name",
            "label" : "Andmeobjekti nimetus",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "Andmeobjekti nimi",
            "mustFill" : true
         }
      ]
   },
   {
      "name" : "infosystem_services",
      "label" : "Infosüsteemid",
      "object" : "service",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:service",
      "groups" : [
         {
            "name" : "main",
            "label" : "Põhiandmed"
         },
         {
            "name" : "serviceLevel",
            "label" : "Teenustase"
         },
         {
            "name" : "serviceArea",
            "label" : "Valdkonnad"
         },
         {
            "name" : "users",
            "label" : "Kasutajad"
         }
      ],
      "groupMenu" : "tabs",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Teenuse inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "group" : "main",
            "order" : 2,
            "listShow" : false,
            "help" : "Teenuse lühinimi"
         },
         {
            "name" : "version",
            "label" : "Versiooni number",
            "type" : "string",
            "group" : "main",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "inimloetav versiooni nr, ei kasutata identifikaatorina"
         },
         {
            "name" : "service_status",
            "label" : "Staatus",
            "type" : "string",
            "group" : "main",
            "order" : 7,
            "listShow" : false,
            "help" : "Teenuse staatus",
            "values" : [
               [
                  "lopetatud",
                  "Lõpetatud"
               ],
               [
                  "lopetamisel",
                  "Lõpetamisel"
               ],
               [
                  "registreeritud",
                  "Registreeritud"
               ]
            ]
         },
         {
            "name" : "url",
            "label" : "Teenuse URL",
            "type" : "string",
            "group" : "main",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenusele ligipääsu URL"
         },
         {
            "name" : "service_type",
            "label" : "Tüüp",
            "type" : "string",
            "group" : "main",
            "order" : 9,
            "listShow" : false,
            "help" : "Teenuse tüüp",
            "values" : [
               [
                  "veebiteenus",
                  "Veebiteenus"
               ],
               [
                  "xtee_teenus",
                  "X-tee v5 teenus"
               ],
               [
                  "mitteelektrooniline_teenus",
                  "Mitteelektrooniline teenus"
               ],
               [
                  "muu_elektrooniline_teenus",
                  "Muu elektrooniline teenus"
               ],
               [
                  "xtee6_teenus",
                  "X-tee v6 teenus"
               ]
            ]
         },
         {
            "name" : "service_code",
            "label" : "Teenuse kood",
            "type" : "string",
            "group" : "main",
            "order" : 3,
            "listShow" : false,
            "help" : "Teenuse kood (x-tee teenuse korral andmekogu ja teenuse koodnimi)"
         },
         {
            "name" : "sensitive_personal_data",
            "label" : "Töödeldakse delikaatseid isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 11,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas teenusega töödeldakse delikaatseid isikuandmeid"
         },
         {
            "name" : "personal_data",
            "label" : "Töödeldakse isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 10,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas teenusega töödeldakse isikuandmeid"
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "group" : "main",
            "order" : 8,
            "listShow" : true,
            "help" : "Teenuse kirjeldus"
         },
         {
            "name" : "iske_security_class_k",
            "label" : "ISKE turvaklass: käideldavus (K)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "K0",
                  "K0"
               ],
               [
                  "K1",
                  "K1"
               ],
               [
                  "K2",
                  "K2"
               ],
               [
                  "K3",
                  "K3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_t",
            "label" : "ISKE turvaklass: terviklus (T)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "T0",
                  "T0"
               ],
               [
                  "T1",
                  "T1"
               ],
               [
                  "T2",
                  "T2"
               ],
               [
                  "T3",
                  "T3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_s",
            "label" : "ISKE turvaklass: konfidentsiaalsus (S)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "S0",
                  "S0"
               ],
               [
                  "S1",
                  "S1"
               ],
               [
                  "S2",
                  "S2"
               ],
               [
                  "S3",
                  "S3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_l",
            "label" : "ISKE turbeaste",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "help" : "\"editWidget\": \"IskeSecurityLevelWidget\"",
            "values" : [
               [
                  "L",
                  "Madal"
               ],
               [
                  "M",
                  "Keskmine"
               ],
               [
                  "H",
                  "Kõrge"
               ]
            ]
         },
         {
            "name" : "same_as_infosystem",
            "label" : "Teenustase sama infosüsteemiga",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 1,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenustaseme parameetrid samad infosüsteemiga"
         },
         {
            "name" : "service_time_24x7",
            "label" : "Tööaeg 24x7",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaeg 24x7",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_start_time",
            "label" : "Tööaja algus",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise alustamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_end_time",
            "label" : "Tööaja lõpp",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise lõpetamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_time_comments",
            "label" : "Märkused",
            "type" : "string",
            "group" : "serviceLevel",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaja märkused",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "incident_initial_response_time",
            "label" : "Intsidentidele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Intsidentidele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_request_initial_response_time",
            "label" : "Teenuse nõuetele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse nõuetele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_consultancy_response_time",
            "label" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_availability",
            "label" : "Kuu keskmine käideldavus (%)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Kuu keskmine käideldavus (%)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "max_duration_of_service_interruption",
            "label" : "Maksimaalne ühekordne katkestuse kestvus (tundi)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 10,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne ühekordne katkestuse kestvus (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "acceptable_response_time",
            "label" : "Standardpäringu aeg (s)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Standardpäringu aeg (s)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_reliability",
            "label" : "Usaldusväärsus (katkestust/kuus)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Usaldusväärsus (katkestust/kuus)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_load_level",
            "label" : "Maksimaalne koormus (kasutajat/minutis)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne koormus (kasutajat/minutis)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "areas",
            "label" : "Seotud valdkonnad",
            "type" : "array:ref:area",
            "group" : "serviceArea",
            "order" : 22,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse valdkonnad"
         }
      ]
   },
   {
      "name" : "service",
      "label" : "Teenused",
      "object" : "service",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:service",
      "menu" : [
         {
            "name" : "general",
            "label" : "Üldandmed",
            "template" : "service",
            "viewmenu" : "service",
            "viewname" : "service",
            "edit" : false
         },
         {
            "name" : "io",
            "label" : "Sisendid/väljundid",
            "template" : "service_io",
            "viewmenu" : "service",
            "viewname" : "service_io",
            "restriction" : "main_resource_id={main_resource_id}&kind=entity"
         },
         {
            "name" : "notifications",
            "label" : "Teated",
            "viewmenu" : "service",
            "url" : "/riha/main"
         }
      ],
      "groups" : [
         {
            "name" : "main",
            "label" : "Põhiandmed"
         },
         {
            "name" : "serviceLevel",
            "label" : "Teenustase"
         },
         {
            "name" : "serviceArea",
            "label" : "Valdkonnad"
         },
         {
            "name" : "users",
            "label" : "Kasutajad"
         }
      ],
      "groupMenu" : "tabs",
      "edit" : false,
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Teenuse inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "group" : "main",
            "order" : 2,
            "listShow" : false,
            "help" : "Teenuse lühinimi"
         },
         {
            "name" : "version",
            "label" : "Versiooni number",
            "type" : "string",
            "group" : "main",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "inimloetav versiooni nr, ei kasutata identifikaatorina"
         },
         {
            "name" : "parent_uri",
            "label" : "Infosüsteem",
            "type" : "ref:infosystem",
            "group" : "main",
            "order" : 3,
            "listShow" : true,
            "help" : "Infosüsteemi URI, mille alla antud teenuse kirjeldus kuulub",
            "edit" : false
         },
         {
            "name" : "service_status",
            "label" : "Staatus",
            "type" : "string",
            "group" : "main",
            "order" : 7,
            "listShow" : false,
            "help" : "Teenuse staatus",
            "values" : [
               [
                  "lopetatud",
                  "Lõpetatud"
               ],
               [
                  "lopetamisel",
                  "Lõpetamisel"
               ],
               [
                  "registreeritud",
                  "Registreeritud"
               ]
            ]
         },
         {
            "name" : "url",
            "label" : "Teenuse URL",
            "type" : "string",
            "group" : "main",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenusele ligipääsu URL"
         },
         {
            "name" : "service_type",
            "label" : "Tüüp",
            "type" : "string",
            "group" : "main",
            "order" : 9,
            "listShow" : false,
            "help" : "Teenuse tüüp",
            "values" : [
               [
                  "veebiteenus",
                  "Veebiteenus"
               ],
               [
                  "xtee_teenus",
                  "X-tee v5 teenus"
               ],
               [
                  "mitteelektrooniline_teenus",
                  "Mitteelektrooniline teenus"
               ],
               [
                  "muu_elektrooniline_teenus",
                  "Muu elektrooniline teenus"
               ],
               [
                  "xtee6_teenus",
                  "X-tee v6 teenus"
               ]
            ]
         },
         {
            "name" : "service_code",
            "label" : "Teenuse kood",
            "type" : "string",
            "group" : "main",
            "order" : 3,
            "listShow" : false,
            "help" : "Teenuse kood (x-tee teenuse korral andmekogu ja teenuse koodnimi)"
         },
         {
            "name" : "sensitive_personal_data",
            "label" : "Töödeldakse delikaatseid isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 11,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas teenusega töödeldakse delikaatseid isikuandmeid"
         },
         {
            "name" : "personal_data",
            "label" : "Töödeldakse isikuandmeid",
            "type" : "boolean",
            "group" : "main",
            "order" : 10,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Kas teenusega töödeldakse isikuandmeid"
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "group" : "main",
            "order" : 8,
            "listShow" : true,
            "help" : "Teenuse kirjeldus"
         },
         {
            "name" : "iske_security_class_k",
            "label" : "ISKE turvaklass: käideldavus (K)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "K0",
                  "K0"
               ],
               [
                  "K1",
                  "K1"
               ],
               [
                  "K2",
                  "K2"
               ],
               [
                  "K3",
                  "K3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_t",
            "label" : "ISKE turvaklass: terviklus (T)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "T0",
                  "T0"
               ],
               [
                  "T1",
                  "T1"
               ],
               [
                  "T2",
                  "T2"
               ],
               [
                  "T3",
                  "T3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_s",
            "label" : "ISKE turvaklass: konfidentsiaalsus (S)",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "values" : [
               [
                  "S0",
                  "S0"
               ],
               [
                  "S1",
                  "S1"
               ],
               [
                  "S2",
                  "S2"
               ],
               [
                  "S3",
                  "S3"
               ]
            ]
         },
         {
            "name" : "iske_security_class_l",
            "label" : "ISKE turbeaste",
            "type" : "string",
            "group" : "main",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "help" : "\"editWidget\": \"IskeSecurityLevelWidget\"",
            "values" : [
               [
                  "L",
                  "Madal"
               ],
               [
                  "M",
                  "Keskmine"
               ],
               [
                  "H",
                  "Kõrge"
               ]
            ]
         },
         {
            "name" : "same_as_infosystem",
            "label" : "Teenustase sama infosüsteemiga",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 1,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenustaseme parameetrid samad infosüsteemiga"
         },
         {
            "name" : "service_time_24x7",
            "label" : "Tööaeg 24x7",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaeg 24x7",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_start_time",
            "label" : "Tööaja algus",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise alustamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_end_time",
            "label" : "Tööaja lõpp",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise lõpetamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_time_comments",
            "label" : "Märkused",
            "type" : "string",
            "group" : "serviceLevel",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaja märkused",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "incident_initial_response_time",
            "label" : "Intsidentidele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Intsidentidele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_request_initial_response_time",
            "label" : "Teenuse nõuetele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse nõuetele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_consultancy_response_time",
            "label" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_availability",
            "label" : "Kuu keskmine käideldavus (%)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Kuu keskmine käideldavus (%)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "max_duration_of_service_interruption",
            "label" : "Maksimaalne ühekordne katkestuse kestvus (tundi)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 10,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne ühekordne katkestuse kestvus (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "acceptable_response_time",
            "label" : "Standardpäringu aeg (s)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Standardpäringu aeg (s)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_reliability",
            "label" : "Usaldusväärsus (katkestust/kuus)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Usaldusväärsus (katkestust/kuus)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_load_level",
            "label" : "Maksimaalne koormus (kasutajat/minutis)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne koormus (kasutajat/minutis)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "areas",
            "label" : "Seotud valdkonnad",
            "type" : "array:ref:area",
            "group" : "serviceArea",
            "order" : 22,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse valdkonnad"
         }
      ]
   },
   {
      "name" : "service_io",
      "label" : "Teenused",
      "object" : "entity",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:entity",
      "fields" : [
         {
            "name" : "name",
            "label" : "Andmeobjekti nimetus",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "Andmeobjekti nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Kirjeldus"
         }
      ]
   },
   {
      "name" : "classifier",
      "label" : "Klassifikaatorid",
      "object" : "classifier",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:classifier",
      "approve" : true,
      "menu" : [
         {
            "name" : "main",
            "label" : "Põhiandmed",
            "template" : "classifier",
            "viewmenu" : "classifier",
            "viewname" : "classifier"
         },
         {
            "name" : "documents",
            "label" : "Klassifikaatori failid",
            "template" : "classifier_documents",
            "viewmenu" : "classifier",
            "viewname" : "classifier_documents",
            "restriction" : "main_resource_id={main_resource_id}&kind=classifier_document"
         },
         {
            "name" : "users",
            "label" : "Registreeritud kasutajad",
            "template" : "classifier_users",
            "viewmenu" : "classifier",
            "viewname" : "classifier_users",
            "restriction" : "classifiers=?{uri}",
            "edit" : false
         },
         {
            "name" : "approval",
            "label" : "Kooskõlastamine",
            "viewmenu" : "classifier",
            "url" : "/riha/main/approvals"
         }
      ],
      "fields" : [
         {
            "name" : "uri",
            "label" : "Unikaalne identifikaator",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Klassifikaatori unikaalne URI",
            "mustFill" : true
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 2,
            "listShow" : true,
            "help" : "Klassifikaatori inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Haldaja",
            "type" : "ref:organization",
            "order" : 5,
            "listShow" : true,
            "help" : "Klassifikaatorit haldava asutuse registrikood",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Klassifikaatori lühinimi"
         },
         {
            "name" : "version",
            "label" : "Versiooni number",
            "type" : "string",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "inimloetav versiooni nr, ei kasutata identifikaatorina"
         },
         {
            "name" : "access_restriction",
            "label" : "Juurdepääsupiirang",
            "type" : "integer",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Juurdepääsupiirang",
            "values" : [
               [
                  "0",
                  "Juurdepääsupiirang puudub"
               ],
               [
                  "1",
                  "Andmeid näevad autenditud kasutajad"
               ],
               [
                  "2",
                  "Andmeid näevad ainult vaatamisõiguse saanud isikud"
               ]
            ]
         },
         {
            "name" : "classifier_status",
            "label" : "Staatus",
            "type" : "string",
            "order" : 4,
            "listShow" : true,
            "help" : "Klassifikaatori seisund",
            "values" : [
               [
                  "sisestamisel",
                  "Sisestamisel"
               ],
               [
                  "kehtestamisel",
                  "Kehtestamisel"
               ],
               [
                  "kehtestatud",
                  "Kehtestatud"
               ],
               [
                  "lopetamisel",
                  "Lõpetamisel"
               ],
               [
                  "lopetatud",
                  "Lõpetatud"
               ]
            ]
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "datetime",
            "order" : 11,
            "listShow" : true,
            "help" : "versiooni kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "datetime",
            "order" : 12,
            "listShow" : true,
            "help" : "versiooni kehtivuse lõpp"
         },
         {
            "name" : "base_classifier",
            "label" : "Rahvusvaheline alusklassifikaator",
            "type" : "string",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Alusklassifikaatori nimi"
         },
         {
            "name" : "legal_basis",
            "label" : "Õiguslik alus",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Õiguslik alus"
         },
         {
            "name" : "update_frequency",
            "label" : "Uuendamissagedus",
            "type" : "string",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Uuendamissagedus"
         },
         {
            "name" : "related_classifiers",
            "label" : "Sidusklassifikaatorid",
            "type" : "array:linked_classifier",
            "order" : 17,
            "filter" : false,
            "listShow" : false,
            "help" : "Sidusklassifikaatorid"
         },
         {
            "name" : "short_description",
            "label" : "Lühiiseloomustus",
            "type" : "string",
            "order" : 16,
            "filter" : false,
            "listShow" : false,
            "help" : "Lühiiseloomustus"
         },
         {
            "name" : "additional_information",
            "label" : "Lisainformatsioon",
            "type" : "string",
            "order" : 19,
            "filter" : false,
            "listShow" : false,
            "help" : "Lisainformatsioon"
         },
         {
            "name" : "areas",
            "label" : "Valdkond",
            "type" : "array:ref:area",
            "order" : 18,
            "extfilter" : true,
            "listShow" : false,
            "help" : "Valdkondade nimed, mis on antud klassifikaatoriga seotud"
         },
         {
            "name" : "approval_required",
            "label" : "Kas muudatused vajavad kooskõlastust",
            "type" : "boolean",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Kas muudatused vajavad kooskõlastust"
         },
         {
            "name" : "base_classifier",
            "label" : "Eelnev klassifikaator",
            "type" : "integer",
            "order" : 14,
            "filter" : false,
            "listShow" : false,
            "help" : "Eelnev klassifikaator"
         },
         {
            "name" : "approved_by_law",
            "label" : "Seaduse alusel vastu võetud ja otse kehtestatuks",
            "type" : "boolean",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Seaduse alusel vastu võetud ja otse kehtestatuks"
         }
      ]
   },
   {
      "name" : "classifier_documents",
      "label" : "Klassifikaatorid",
      "object" : "classifier_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:classifier_document",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi"
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "date",
            "order" : 5,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "date",
            "order" : 6,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse lõpp"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 10,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "type",
            "label" : "Dokumendi liik",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi liik",
            "values" : [
               [
                  "yleminekutabel",
                  "Üleminekutabel"
               ],
               [
                  "vastavus",
                  "Vastavus"
               ],
               [
                  "klassifikaator",
                  "Klassifikaator"
               ],
               [
                  "muu",
                  "Muu"
               ]
            ]
         },
         {
            "name" : "doc_date",
            "label" : "Kuupäev",
            "type" : "date",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kuupäev"
         },
         {
            "name" : "no",
            "label" : "Nr",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi number"
         }
      ]
   },
   {
      "name" : "classifier_users",
      "label" : "Klassifikaatorid",
      "object" : "infosystem",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:infosystem",
      "edit" : false,
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Infosüsteemi inimloetav nimi",
            "mustFill" : true
         }
      ]
   },
   {
      "name" : "entity",
      "label" : "Andmeobjektid",
      "object" : "entity",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:entity",
      "edit" : false,
      "fields" : [
         {
            "name" : "name",
            "label" : "Andmeobjekti nimetus",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "Andmeobjekti nimi",
            "mustFill" : true
         },
         {
            "name" : "main_resource_id",
            "label" : "Infosüsteem",
            "type" : "id:infosystem",
            "order" : 2,
            "listShow" : true,
            "help" : "Konkreetne infosüsteemi versiooni id, mille all objekt on",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Kirjeldus"
         },
         {
            "name" : "semantics",
            "label" : "Valdkonna termin",
            "type" : "array:string",
            "order" : 8,
            "listShow" : false,
            "help" : "terminite tekstiline list, mis esitavad veergude/välja tähendust"
         },
         {
            "name" : "main_data",
            "label" : "Põhiandmed",
            "type" : "boolean",
            "order" : 6,
            "listShow" : true,
            "help" : "Tegemist on andmekogu põhiandmetega"
         },
         {
            "name" : "sensitive_personal_data",
            "label" : "Delikaatsed isikuandmed",
            "type" : "boolean",
            "order" : 5,
            "listShow" : true,
            "help" : "Tegemist on delikaatsete isikuandmetega"
         },
         {
            "name" : "personal_data",
            "label" : "Isikuandmed",
            "type" : "boolean",
            "order" : 4,
            "listShow" : true,
            "help" : "Tegemist on isikuandmetega"
         },
         {
            "name" : "archival_type",
            "label" : "Arhiiviväärtus",
            "type" : "string",
            "order" : 8,
            "listShow" : false,
            "help" : "arhiiviväärtuse/säilitustähtaja määrang fikseeritud loeteluna",
            "values" : [
               [
                  "hiljem",
                  "Hiljem"
               ],
               [
                  "jah",
                  "Jah"
               ],
               [
                  "ei",
                  "Ei"
               ]
            ]
         },
         {
            "name" : "function",
            "label" : "Seotud funktsioon/sari",
            "type" : "ref:function",
            "filter" : false,
            "listShow" : false,
            "help" : "Säilitamisega seotud funktsioonide nimed, mille alla antud andmeobjekt kuulub.",
            "restriction" : "main_resource_id={main_resource_id}"
         },
         {
            "name" : "main_infosystem",
            "label" : "Põhi-infosüsteem",
            "type" : "ref:infosystem",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Kui tegemist ei ole andmekogu põhiandmetega, siis infosüsteemi URI, kust antud atribuut pärit on.",
            "showOnlyWhen" : {
               "main_data" : "false"
            }
         }
      ]
   },
   {
      "name" : "area",
      "label" : "Valdkonnad ja sõnastikud",
      "object" : "area",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:area",
      "menu" : [
         {
            "name" : "general",
            "label" : "Üldandmed",
            "template" : "area",
            "viewmenu" : "area",
            "viewname" : "area"
         },
         {
            "name" : "vocabulary",
            "label" : "Sõnastikud",
            "template" : "vocabulary",
            "viewmenu" : "area",
            "viewname" : "vocabulary",
            "restriction" : "main_resource_id={main_resource_id}&kind=vocabulary"
         }
      ],
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimetus",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Valdkonna nimetus",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Valdkonna lühinimi"
         },
         {
            "name" : "state",
            "label" : "Olek",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Valdkonna kirje olek",
            "values" : [
               [
                  "C",
                  "Kehtiv"
               ],
               [
                  "O",
                  "Vana/kehtetu"
               ],
               [
                  "T",
                  "Ajutine"
               ],
               [
                  "D",
                  "Kustutatud"
               ],
               [
                  "N",
                  "Uus/projekt"
               ]
            ]
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Kirjeldus"
         }
      ]
   },
   {
      "name" : "vocabulary",
      "label" : "Valdkonnad ja sõnastikud",
      "object" : "vocabulary",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:vocabulary",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Dokumendi kirjeldus",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kirjeldus"
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "date",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "date",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse lõpp"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "version",
            "label" : "Versioon",
            "type" : null,
            "order" : 5,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi versioon"
         }
      ]
   },
   {
      "name" : "xmlasset",
      "label" : "XML varad",
      "object" : "xmlasset",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:xmlasset",
      "approve" : true,
      "menu" : [
         {
            "name" : "general",
            "label" : "Üldandmed",
            "template" : "xmlasset",
            "viewmenu" : "xmlasset",
            "viewname" : "xmlasset"
         },
         {
            "name" : "documents",
            "label" : "Failid",
            "template" : "xmlasset_documents",
            "viewmenu" : "xmlasset",
            "viewname" : "xmlasset_documents",
            "restriction" : "main_resource_id={main_resource_id}&kind=xmlasset_document"
         },
         {
            "name" : "reviews",
            "label" : "Hinnangud",
            "viewmenu" : "xmlasset",
            "url" : "/riha/main"
         },
         {
            "name" : "approval",
            "label" : "Kooskõlastamine",
            "viewmenu" : "xmlasset",
            "url" : "/riha/main"
         }
      ],
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "XML vara inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "order" : 11,
            "extfilter" : true,
            "listShow" : false,
            "help" : "XML vara haldava asutuse registrikood",
            "mustFill" : true
         },
         {
            "name" : "version",
            "label" : "Versioon",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "inimloetav versiooni nr, ei kasutata identifikaatorina"
         },
         {
            "name" : "status",
            "label" : "Staatus",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Staatus",
            "values" : [
               [
                  "kava_sisestamisel",
                  "Kava sisestamisel"
               ],
               [
                  "kava_kooskolastamisel",
                  "Kava kooskõlastamisel"
               ],
               [
                  "kava_registreerimisel",
                  "Kava registreerimisel"
               ],
               [
                  "ettepanek_sisestamisel",
                  "Ettepanek sisestamisel"
               ],
               [
                  "ettepanek_kooskolastamisel",
                  "Ettepanek kooskõlastamisel"
               ],
               [
                  "ettepanek_registreerimisel",
                  "Ettepanek registreerimisel"
               ],
               [
                  "registreeritud",
                  "Registreeritud"
               ],
               [
                  "lopetamine_kooskolastamisel",
                  "Lõpetamine kooskõlastamisel"
               ],
               [
                  "lopetamine_registreerimisel",
                  "Lõpetamine registreerimisel"
               ],
               [
                  "lopetatud",
                  "Lõpetatud"
               ]
            ]
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 6,
            "listShow" : false,
            "help" : "Kirjeldus"
         },
         {
            "name" : "retention_period",
            "label" : "Säilitustähtaeg aastates",
            "type" : "number",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Säilitustähtaeg aastates"
         },
         {
            "name" : "type",
            "label" : "Liik",
            "type" : "array:string",
            "order" : 10,
            "listShow" : true,
            "help" : "Liik",
            "values" : [
               [
                  "andmevahetuse_konteiner",
                  "Andmevahetuse konteiner"
               ],
               [
                  "standardsed_metaandmed",
                  "Standardsed metaandmed"
               ],
               [
                  "xml_andmekirjeldus",
                  "XML andmekirjeldus"
               ],
               [
                  "xbrl_taksonoomia",
                  "XBRL taksonoomia"
               ]
            ]
         },
         {
            "name" : "areas",
            "label" : "Valdkonnad",
            "type" : "array:ref:area",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Valdkondade nimed, mis on antud XML varaga seotud"
         },
         {
            "name" : "contact_persons",
            "label" : "Kontaktisikud",
            "type" : "array:linked_person",
            "filter" : false,
            "listShow" : false,
            "help" : "XML vara kontaktisikute info"
         },
         {
            "name" : "license_text",
            "label" : "Litsentsi tekst",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Litsentsi tekst"
         },
         {
            "name" : "license_url",
            "label" : "Litsentsi URL",
            "type" : "string",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Litsentsi URL"
         },
         {
            "name" : "published",
            "label" : "Publitseeritud",
            "type" : "boolean",
            "listShow" : true
         }
      ]
   },
   {
      "name" : "xmlasset_documents",
      "label" : "XML varad",
      "object" : "xmlasset_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:xmlasset_document",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi"
         },
         {
            "name" : "description",
            "label" : "Dokumendi kirjeldus",
            "type" : "string",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kirjeldus"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "type",
            "label" : "Dokumendi liik",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi liik",
            "values" : [
               [
                  "projekti_yles_dokument",
                  "Projekti lähteülesande dokument"
               ],
               [
                  "naidisdokument_xml",
                  "Näidisdokument (XML)"
               ],
               [
                  "naidisdokument_pdf",
                  "Näidisdokument (PDF)"
               ],
               [
                  "pohiosa_xml_skeem",
                  "Põhiosa XML skeem"
               ],
               [
                  "taiendav_xml_skeem",
                  "Täiendav XML skeem"
               ],
               [
                  "xml_vara_dokumentatsioon",
                  "XML vara dokumentatsioon"
               ],
               [
                  "xsl_stiilileht",
                  "XSL stiilileht"
               ]
            ]
         }
      ]
   },
   {
      "name" : "vocabulary",
      "label" : "Sõnastik",
      "object" : "vocabulary",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:vocabulary",
      "fields" : [
         {
            "name" : "url",
            "label" : "URL",
            "type" : "string",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi URL, mille kaudu see on loetav"
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Dokumendi kirjeldus",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kirjeldus"
         },
         {
            "name" : "start_date",
            "label" : "Kehtivuse algus",
            "type" : "date",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse algus"
         },
         {
            "name" : "end_date",
            "label" : "Kehtivuse lõpp",
            "type" : "date",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi kehtivuse lõpp"
         },
         {
            "name" : "content",
            "label" : "Fail",
            "type" : "base64",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi sisu"
         },
         {
            "name" : "version",
            "label" : "Versioon",
            "type" : null,
            "order" : 5,
            "filter" : false,
            "listShow" : true,
            "help" : "Dokumendi versioon"
         }
      ]
   },
   {
      "name" : "function",
      "label" : "Funktsioon",
      "object" : "function",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:function",
      "fields" : [
         {
            "name" : "uri",
            "label" : "Unikaalne identifikaator",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Infosüsteemi funktsiooni versioonist sõltumatu URI",
            "mustFill" : true
         },
         {
            "name" : "name",
            "label" : "Funktsiooni/sarja nimi",
            "type" : "string",
            "order" : 2,
            "listShow" : true,
            "help" : "Infosüsteemi funktsiooni nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Kirjeldus"
         },
         {
            "name" : "archival_type",
            "label" : "Arhiiviväärtuse/säilitustähtaja määrang",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "arhiiviväärtuse/säilitustähtaja määrang fikseeritud loeteluna",
            "values" : [
               [
                  "hiljem",
                  "Hiljem"
               ],
               [
                  "jah",
                  "Jah"
               ],
               [
                  "ei",
                  "Ei"
               ]
            ]
         },
         {
            "name" : "retention_period",
            "label" : "Säilitustähtaeg",
            "type" : "number",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Andmeobjekti säilitustähtaeg"
         }
      ]
   },
   {
      "name" : "database",
      "label" : "Andmebaas",
      "object" : "database",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:database"
   },
   {
      "name" : "table",
      "label" : "Tabel",
      "object" : "table",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:table"
   },
   {
      "name" : "field",
      "label" : "Väli",
      "object" : "field",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:field"
   },
   {
      "name" : "document",
      "label" : "Dokument",
      "object" : "document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:document"
   },
   {
      "name" : "infosystem_source_document",
      "label" : "Infosüsteemi alusdokument",
      "object" : "infosystem_source_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:infosystem_source_document"
   },
   {
      "name" : "classifier_document",
      "label" : "Klassifikaatori dokument",
      "object" : "classifier_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:classifier_document"
   },
   {
      "name" : "xmlasset_document",
      "label" : "XML vara dokument",
      "object" : "xmlasset_document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:xmlasset_document"
   },
   {
      "name" : "comment",
      "label" : "Kommentaar",
      "object" : "comment",
      "table" : "comment",
      "key" : "comment_id",
      "fields" : [
         {
            "name" : "uri",
            "label" : "Unikaalne identifikaator",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Kommentaari unikaalne URI, mis on kasutaja määrata"
         },
         {
            "name" : "organization",
            "label" : "Kommentaari omanik",
            "type" : "ref:organization",
            "filter" : false,
            "listShow" : false,
            "help" : "Kommentaari omanik"
         },
         {
            "name" : "main_resource_uri",
            "label" : "Seotud infosüsteemi või teenuse URI",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud infosüsteemi või teenuse URI"
         },
         {
            "name" : "data_object_uri",
            "label" : "Seotud andmeobjekti URI",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud andmeobjekti URI"
         },
         {
            "name" : "document_uri",
            "label" : "Seotud dokumendi URI",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud dokumendi URI"
         },
         {
            "name" : "comment_uri",
            "label" : "Seotud kommentaari URI",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud kommentaari URI"
         },
         {
            "name" : "access_restriction",
            "label" : "Juurdepääsupiirang",
            "type" : "integer",
            "filter" : false,
            "listShow" : false,
            "help" : "Juurdepääsupiirang",
            "values" : [
               [
                  "0",
                  "Juurdepääsupiirang puudub"
               ],
               [
                  "1",
                  "Andmeid näevad autenditud kasutajad"
               ],
               [
                  "2",
                  "Andmeid näevad ainult vaatamisõiguse saanud isikud"
               ]
            ]
         },
         {
            "name" : "state",
            "label" : "Kommentaari olek",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Kommentaari olek",
            "values" : [
               [
                  "C",
                  "Kehtiv"
               ],
               [
                  "O",
                  "Vana/kehtetu"
               ],
               [
                  "T",
                  "Ajutine"
               ],
               [
                  "D",
                  "Kustutatud"
               ],
               [
                  "N",
                  "Uus/projekt"
               ]
            ]
         },
         {
            "name" : "creator",
            "label" : "algne sisestaja",
            "type" : "ref:person",
            "filter" : false,
            "listShow" : false,
            "help" : "algne sisestaja"
         },
         {
            "name" : "modifier",
            "label" : "viimane muutja",
            "type" : "ref:person",
            "filter" : false,
            "listShow" : false,
            "help" : "viimane muutja"
         },
         {
            "name" : "creation_date",
            "label" : "algne sisestamisaeg",
            "type" : "datetime",
            "filter" : false,
            "listShow" : false,
            "help" : "algne sisestamisaeg"
         },
         {
            "name" : "modified_date",
            "label" : "viimase muutmise aeg",
            "type" : "datetime",
            "filter" : false,
            "listShow" : false,
            "help" : "viimase muutmise aeg"
         },
         {
            "name" : "content",
            "label" : "Kommentaari tekst",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Kommentaari tekst"
         }
      ]
   },
   {
      "name" : "translation",
      "label" : "Tõlge",
      "object" : "translation"
   },
   {
      "name" : "linked_infosystem",
      "label" : "Seotud infosüsteem",
      "object" : "linked_infosystem",
      "fields" : [
         {
            "name" : "type",
            "label" : "Liik",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : false,
            "help" : "Seose tüüp",
            "values" : [
               [
                  "ylem",
                  "Üleminfosüsteem"
               ],
               [
                  "standard",
                  "Standardinfosüsteem"
               ]
            ]
         },
         {
            "name" : "uri",
            "label" : "Nimi",
            "type" : "ref:infosystem",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud infosüteem"
         }
      ]
   },
   {
      "name" : "linked_organization",
      "label" : "Seotud organisatsioon",
      "object" : "linked_organization",
      "fields" : [
         {
            "name" : "organization",
            "label" : "Nimetus",
            "type" : "ref:organization",
            "order" : 1,
            "listShow" : true,
            "help" : "Seotud organisatsioon"
         },
         {
            "name" : "date_from",
            "label" : "Alates",
            "type" : "datetime",
            "order" : 3,
            "filter" : false,
            "listShow" : true,
            "help" : "Seotuse alguskuupäev"
         },
         {
            "name" : "date_to",
            "label" : "Kuni",
            "type" : "datetime",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "Seotuse lõppkuupäev"
         },
         {
            "name" : "type",
            "label" : "Liik",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Seose liik",
            "values" : [
               [
                  "haldaja",
                  "Vastutav töötleja"
               ],
               [
                  "pidaja",
                  "Volitatud töötleja"
               ],
               [
                  "haldaja_pidaja",
                  "Vastutav ja volitatud töötleja"
               ]
            ]
         }
      ]
   },
   {
      "name" : "linked_person",
      "label" : "Seotud isik",
      "object" : "linked_person",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : false,
            "help" : "Kontaktisiku ees- ja perekonnanimi"
         },
         {
            "name" : "epost",
            "label" : "E-post",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Kontaktisiku e-posti aadress"
         },
         {
            "name" : "phone",
            "label" : "Telefon",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Kontaktisiku telefoninumber"
         }
      ]
   },
   {
      "name" : "linked_classifier",
      "label" : "Seotud klassifikaator",
      "object" : "linked_classifier",
      "fields" : [
         {
            "name" : "type",
            "label" : "Seose tüüp",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seose tüüp",
            "values" : [
               [
                  "preceding",
                  "Eelnev"
               ],
               [
                  "associated",
                  "Seotud"
               ]
            ]
         },
         {
            "name" : "uri",
            "label" : "Seotud klassifikaator",
            "type" : "ref:classifier",
            "filter" : false,
            "listShow" : false,
            "help" : "Seotud klassifikaator"
         },
         {
            "name" : "description",
            "label" : "Seose kirjeldus",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Seose kirjeldus"
         }
      ]
   },
   {
      "name" : "iske_audit",
      "label" : "ISKE audit",
      "object" : "iske_audit",
      "fields" : [
         {
            "name" : "iske_audit_status",
            "label" : "Staatus",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "ISKE auditi staatus",
            "values" : [
               [
                  "auditit_ei_labinud",
                  "Auditit ei läbinud"
               ],
               [
                  "audit_markustega",
                  "Audit märkustega"
               ],
               [
                  "audit_markusteta",
                  "Audit märkusteta"
               ]
            ]
         },
         {
            "name" : "iske_audit_date",
            "label" : "Kuupäev",
            "type" : "date",
            "filter" : false,
            "listShow" : false,
            "help" : "ISKE auditi kuupäev"
         },
         {
            "name" : "iske_audit_deadline",
            "label" : "Tähtaeg",
            "type" : "date",
            "filter" : false,
            "listShow" : false,
            "help" : "ISKE auditi tähtaeg"
         }
      ]
   },
   {
      "name" : "development",
      "label" : "Arendus",
      "object" : "development"
   },
   {
      "name" : "service_level",
      "label" : "Teenustase",
      "object" : "service_level",
      "fields" : [
         {
            "name" : "same_as_infosystem",
            "label" : "Teenustase sama infosüsteemiga",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 1,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenustaseme parameetrid samad infosüsteemiga"
         },
         {
            "name" : "service_time_24x7",
            "label" : "Tööaeg 24x7",
            "type" : "boolean",
            "group" : "serviceLevel",
            "order" : 2,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaeg 24x7",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_start_time",
            "label" : "Tööaja algus",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise alustamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_offering_end_time",
            "label" : "Tööaja lõpp",
            "type" : "time",
            "group" : "serviceLevel",
            "order" : 4,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse osutamise lõpetamise kellaaeg",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_time_comments",
            "label" : "Märkused",
            "type" : "string",
            "group" : "serviceLevel",
            "order" : 5,
            "filter" : false,
            "listShow" : false,
            "help" : "Tööaja märkused",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "incident_initial_response_time",
            "label" : "Intsidentidele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 6,
            "filter" : false,
            "listShow" : false,
            "help" : "Intsidentidele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_request_initial_response_time",
            "label" : "Teenuse nõuetele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 7,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse nõuetele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_consultancy_response_time",
            "label" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 8,
            "filter" : false,
            "listShow" : false,
            "help" : "Teenuse konsultatsioonipäringutele reageerimise aeg (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_availability",
            "label" : "Kuu keskmine käideldavus (%)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 9,
            "filter" : false,
            "listShow" : false,
            "help" : "Kuu keskmine käideldavus (%)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "max_duration_of_service_interruption",
            "label" : "Maksimaalne ühekordne katkestuse kestvus (tundi)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 10,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne ühekordne katkestuse kestvus (h)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "acceptable_response_time",
            "label" : "Standardpäringu aeg (s)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 11,
            "filter" : false,
            "listShow" : false,
            "help" : "Standardpäringu aeg (s)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "monthly_average_service_reliability",
            "label" : "Usaldusväärsus (katkestust/kuus)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 12,
            "filter" : false,
            "listShow" : false,
            "help" : "Usaldusväärsus (katkestust/kuus)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         },
         {
            "name" : "service_load_level",
            "label" : "Maksimaalne koormus (kasutajat/minutis)",
            "type" : "number",
            "group" : "serviceLevel",
            "order" : 13,
            "filter" : false,
            "listShow" : false,
            "help" : "Maksimaalne koormus (kasutajat/minutis)",
            "showOnlyWhen" : {
               "same_as_infosystem" : "false"
            }
         }
      ]
   },
   {
      "name" : "template",
      "label" : "Mall",
      "object" : "template",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:template",
      "fields" : [
         {
            "name" : "uri",
            "label" : "Unikaalne identifikaator",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Malli unikaalne URI, mis on kasutaja määrata",
            "mustFill" : true
         },
         {
            "name" : "name",
            "label" : "Tehniline nimi",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Malli tehniline nimi",
            "mustFill" : true
         },
         {
            "name" : "label",
            "label" : "Nimi",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "Malli nimi",
            "mustFill" : true
         },
         {
            "name" : "parent_uri",
            "label" : "Ülemmall",
            "type" : "ref:template",
            "filter" : false,
            "listShow" : false,
            "help" : "Alammalli korral ülemmalli URI"
         },
         {
            "name" : "state",
            "label" : "Kirje olek",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Malli kirjelduse olek",
            "values" : [
               [
                  "C",
                  "Kehtiv"
               ],
               [
                  "O",
                  "Vana/kehtetu"
               ],
               [
                  "T",
                  "Ajutine"
               ],
               [
                  "D",
                  "Kustutatud"
               ],
               [
                  "N",
                  "Uus/projekt"
               ]
            ]
         },
         {
            "name" : "component",
            "label" : "Komponent",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Malli kuvamiseks kasutatav komponent"
         },
         {
            "name" : "object",
            "label" : "Objekt",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Mallile vastav RIHA objekt",
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ]
            ]
         },
         {
            "name" : "table",
            "label" : "Tabel",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "RIHa objekti hoidmiseks kasutatav andmebaasitabeli nimi"
         },
         {
            "name" : "key",
            "label" : "Võtmeväli",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "RIHA objekti hoidmiseks kasutatava andmebaasitabeli võtmeväja nimi"
         },
         {
            "name" : "refField",
            "label" : "Viiteväli",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Väli, mille abil saab unikaalselt antud objektile viidata"
         },
         {
            "name" : "nameField",
            "label" : "Nimeväli",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Väli, mis sisaldab objekti nime"
         },
         {
            "name" : "menu",
            "label" : "Menüü",
            "type" : "array:template_menu",
            "filter" : false,
            "listShow" : false,
            "help" : "Malliga seotud menüü"
         },
         {
            "name" : "groups",
            "label" : "Tabid",
            "type" : "array:template_groups",
            "filter" : false,
            "listShow" : false,
            "help" : "Malliga seotud tabid"
         },
         {
            "name" : "fields",
            "label" : "Väljad",
            "type" : "array:template_fields",
            "filter" : false,
            "listShow" : false,
            "help" : "Malliga seotud objekti väljade kirjeldus"
         }
      ]
   },
   {
      "name" : "template_menu",
      "label" : "Malli menüü",
      "object" : "template_menu",
      "fields" : [
         {
            "name" : "name",
            "label" : "Kood",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Menüüvaliku tehniline nimi"
         },
         {
            "name" : "label",
            "label" : "Nimi",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Menüüvaliku inimloetav nimi"
         },
         {
            "name" : "template",
            "label" : "Seotud mall",
            "type" : "ref:template",
            "filter" : false,
            "listShow" : false,
            "help" : "Menüüvalikule vastav mall"
         },
         {
            "name" : "restriction",
            "label" : "Piirangud",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Malli objektidele rakendatav piirang"
         }
      ]
   },
   {
      "name" : "template_groups",
      "label" : "Malli tabid",
      "object" : "template_groups",
      "fields" : [
         {
            "name" : "name",
            "label" : "Kood",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Tabi tehniline nimi"
         },
         {
            "name" : "label",
            "label" : "Nimi",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Tabi inimloetav nimi"
         }
      ]
   },
   {
      "name" : "template_fields",
      "label" : "Malli väljad",
      "object" : "template_fields",
      "fields" : [
         {
            "name" : "name",
            "label" : "Kood",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Tabi tehniline nimi"
         },
         {
            "name" : "label",
            "label" : "Nimi",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Tabi inimloetav nimi"
         },
         {
            "name" : "type",
            "label" : "Andmetüüp",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Andmetüüp"
         },
         {
            "name" : "group",
            "label" : "Tab",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Tab"
         },
         {
            "name" : "order",
            "label" : "Jrknr",
            "type" : "integer",
            "filter" : false,
            "listShow" : false,
            "help" : "Jrknr"
         },
         {
            "name" : "filter",
            "label" : "Kuvatakse otsingus",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvatakse otsingus"
         },
         {
            "name" : "extfilter",
            "label" : "Kuvatakse laiendatud otsingus",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvatakse laiendatud otsingus"
         },
         {
            "name" : "listShow",
            "label" : "Kuvatakse nimekirjas",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvatakse nimekirjas"
         },
         {
            "name" : "editShow",
            "label" : "Kuvatakse muutmise lehel",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvatakse muutmise lehel"
         },
         {
            "name" : "viewShow",
            "label" : "Kivatakse vaatamise lehel",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kivatakse vaatamise lehel"
         },
         {
            "name" : "addShow",
            "label" : "Kuvatakse lisamise lehel",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvatakse lisamise lehel"
         },
         {
            "name" : "edit",
            "label" : "On muudetav väli",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "On muudetav väli"
         },
         {
            "name" : "values",
            "label" : "Lubatavad väärtused",
            "type" : "json",
            "filter" : false,
            "listShow" : false,
            "help" : "Lubatavad väärtused"
         },
         {
            "name" : "widget",
            "label" : "Välja esitamiseks kasutatav komponent",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Välja esitamiseks kasutatav komponent"
         },
         {
            "name" : "template",
            "label" : "Kuvamiseks kasutatav mall",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvamiseks kasutatav mall"
         },
         {
            "name" : "help",
            "label" : "Abitekst",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Abitekst"
         },
         {
            "name" : "showOnlyWhen",
            "label" : "Kuvamise tingimused",
            "type" : "json",
            "filter" : false,
            "listShow" : false,
            "help" : "Kuvamise tingimused"
         },
         {
            "name" : "mustFill",
            "label" : "Väärtus on kohustuslik",
            "type" : "boolean",
            "filter" : false,
            "listShow" : false,
            "help" : "Väärtus on kohustuslik"
         }
      ]
   },
   {
      "name" : "person",
      "label" : "Isik",
      "object" : "person",
      "table" : "asutused.isik",
      "key" : "i_id",
      "refField" : "kood",
      "nameField" : "perenimi",
      "refTemplate" : "ref:person",
      "fields" : [
         {
            "name" : "kood",
            "label" : "Isikukood",
            "type" : "string",
            "order" : 3,
            "filter" : false,
            "listShow" : false,
            "help" : "Inimese isikukood"
         },
         {
            "name" : "eesnimi",
            "label" : "Eesnimi",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Eesnimi"
         },
         {
            "name" : "perenimi",
            "label" : "Perekonnanimi",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Perekonnanimi"
         }
      ]
   },
   {
      "name" : "search",
      "label" : "Otsing",
      "object" : "",
      "key" : "key",
      "list_templates" : [
         "search_infosystem",
         "search_service",
         "search_entity",
         "search_classifier",
         "search_document",
         "search_area",
         "search_xmlasset"
      ],
      "edit" : false,
      "fields" : [
         {
            "name" : "kind",
            "label" : "Liik",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "RIHA põhiobjekti liik",
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ]
            ]
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : null,
            "order" : 1,
            "listShow" : true,
            "help" : "Nimi või nimeosa"
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : null,
            "order" : 4,
            "listShow" : true,
            "help" : "Kirjelduses sisaldub"
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "order" : 5,
            "listShow" : true,
            "help" : "Omanik"
         }
      ]
   },
   {
      "name" : "search_infosystem",
      "label" : "Infosüsteem",
      "object" : "infosystem",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:infosystem",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Infosüsteemi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "group" : "main",
            "order" : 3,
            "listShow" : true,
            "help" : "Infosüsteemi omaniku registrikood",
            "mustFill" : true
         },
         {
            "name" : "kind",
            "label" : "Objekti liik",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "RIHA põhiobjekti liik",
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ],
               [
                  "service",
                  "Teenus"
               ],
               [
                  "document",
                  "Dokument"
               ]
            ]
         }
      ]
   },
   {
      "name" : "search_service",
      "label" : "Teenus",
      "object" : "service",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:service",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "group" : "main",
            "order" : 1,
            "listShow" : true,
            "help" : "Teenuse inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "group" : "main",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Teenuse omaniku registrikood",
            "mustFill" : true
         },
         {
            "name" : "short_name",
            "label" : "Lühinimi",
            "type" : "string",
            "group" : "main",
            "order" : 2,
            "listShow" : false,
            "help" : "Teenuse lühinimi"
         },
         {
            "name" : "parent_uri",
            "label" : "Infosüsteem",
            "type" : "ref:infosystem",
            "group" : "main",
            "order" : 3,
            "listShow" : true,
            "help" : "Infosüsteemi URI, mille alla antud teenuse kirjeldus kuulub",
            "edit" : false
         },
         {
            "name" : "kind",
            "label" : "Objekti liik",
            "type" : "enum:kind",
            "order" : 4,
            "filter" : false,
            "listShow" : true,
            "help" : "RIHA põhiobjekti liik"
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "group" : "main",
            "order" : 8,
            "listShow" : true,
            "help" : "Teenuse kirjeldus"
         }
      ]
   },
   {
      "name" : "search_entity",
      "label" : "Andmeobjekt",
      "object" : "entity",
      "table" : "data_object",
      "key" : "data_object_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:entity",
      "fields" : [
         {
            "name" : "name",
            "label" : "Andmeobjekti nimetus",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "Andmeobjekti nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 3,
            "listShow" : true,
            "help" : "Kirjeldus"
         }
      ]
   },
   {
      "name" : "search_classifier",
      "label" : "Klassifikaator",
      "object" : "classifier",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:classifier",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 2,
            "listShow" : true,
            "help" : "Klassifikaatori inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Haldaja",
            "type" : "ref:organization",
            "order" : 5,
            "listShow" : true,
            "help" : "Klassifikaatorit haldava asutuse registrikood",
            "mustFill" : true
         },
         {
            "name" : "parent_uri",
            "label" : "Vanemklassifikaator",
            "type" : "ref:classifier",
            "filter" : false,
            "listShow" : true,
            "help" : "Versioonist sõltumatu hiearhia viit - klassifikaatori korral ei kasutata"
         },
         {
            "name" : "kind",
            "label" : "Objekti liik",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "RIHA põhiobjekti liik",
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ],
               [
                  "service",
                  "Teenus"
               ],
               [
                  "document",
                  "Dokument"
               ]
            ]
         },
         {
            "name" : "short_description",
            "label" : "Lühiiseloomustus",
            "type" : "string",
            "order" : 16,
            "filter" : false,
            "listShow" : true,
            "help" : "Lühiiseloomustus"
         }
      ]
   },
   {
      "name" : "search_area",
      "label" : "Valdkond",
      "object" : "area",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:area",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimetus",
            "type" : "string",
            "order" : 1,
            "filter" : false,
            "listShow" : true,
            "help" : "Valdkonna nimetus",
            "mustFill" : true
         }
      ]
   },
   {
      "name" : "search_vocabulary",
      "label" : "Sõnastik",
      "object" : "vocabulary",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:vocabulary"
   },
   {
      "name" : "search_xmlasset",
      "label" : "XML vara",
      "object" : "xmlasset",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:xmlasset",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 1,
            "listShow" : true,
            "help" : "XML vara inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "owner",
            "label" : "Omanik",
            "type" : "ref:organization",
            "order" : 11,
            "extfilter" : true,
            "listShow" : true,
            "help" : "XML vara haldava asutuse registrikood",
            "mustFill" : true
         },
         {
            "name" : "parent_uri",
            "label" : "Vanemvara",
            "type" : "ref:xmlasset",
            "filter" : false,
            "listShow" : true,
            "help" : "Versioonist sõltumatu hiearhia viit - xml vara korral ei kasutata"
         },
         {
            "name" : "kind",
            "label" : "Objekti liik",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "RIHA põhiobjekti liik",
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ],
               [
                  "service",
                  "Teenus"
               ],
               [
                  "document",
                  "Dokument"
               ]
            ]
         },
         {
            "name" : "description",
            "label" : "Kirjeldus",
            "type" : "string",
            "order" : 6,
            "listShow" : true,
            "help" : "Kirjeldus"
         }
      ]
   },
   {
      "name" : "search_document",
      "label" : "Dokument",
      "object" : "document",
      "table" : "document",
      "key" : "document_id",
      "refField" : "uri",
      "nameField" : "name",
      "refTemplate" : "ref:document",
      "fields" : [
         {
            "name" : "kind",
            "label" : "Objekti liik",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "values" : [
               [
                  "infosystem",
                  "Infosüsteem"
               ],
               [
                  "classifier",
                  "Klassifikaator"
               ],
               [
                  "area",
                  "Valdkond"
               ],
               [
                  "vocabulary",
                  "Sõnastik"
               ],
               [
                  "xmlasset",
                  "XML resurss"
               ],
               [
                  "service",
                  "Teenus"
               ],
               [
                  "document",
                  "Dokument"
               ]
            ]
         },
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "order" : 2,
            "filter" : false,
            "listShow" : true,
            "help" : "Idokumendi inimloetav nimi",
            "mustFill" : true
         },
         {
            "name" : "description",
            "label" : "Dokumendi kirjeldus",
            "type" : "string",
            "filter" : false,
            "listShow" : false,
            "help" : "Dokumendi kirjeldus"
         }
      ]
   },
   {
      "name" : "ref:xmlasset",
      "label" : "XML vara",
      "object" : "xmlasset",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "listShow" : true,
            "help" : "XML vara inimloetav nimi"
         }
      ]
   },
   {
      "name" : "ref:function",
      "label" : "Funktsioon",
      "object" : "function",
      "table" : "data_object",
      "key" : "data_object_id",
      "fields" : [
         {
            "name" : "name",
            "label" : "Funktsiooni/sarja nimi",
            "type" : "string",
            "listShow" : true,
            "help" : "Infosüsteemi funktsiooni nimi"
         }
      ]
   },
   {
      "name" : "ref:organization",
      "label" : "Asutus",
      "object" : "organization",
      "table" : "asutused.asutus",
      "key" : "asutus_id",
      "fields" : [
         {
            "name" : "nimetus",
            "label" : "Nimi",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "Asutuse nimi"
         }
      ]
   },
   {
      "name" : "ref:infosystem",
      "label" : "Infosüsteem",
      "object" : "infosystem",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "listShow" : true,
            "help" : "Infosüsteemi inimloetav nimi"
         }
      ]
   },
   {
      "name" : "ref:template",
      "label" : "Mall",
      "object" : "template",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "fields" : [
         {
            "name" : "name",
            "label" : "Tehniline nimi",
            "type" : "string",
            "listShow" : true,
            "help" : "Malli tehniline nimi"
         }
      ]
   },
   {
      "name" : "ref:person",
      "label" : "Isik",
      "object" : "person",
      "table" : "asutused.isik",
      "key" : "i_id",
      "fields" : [
         {
            "name" : "perenimi",
            "label" : "Perekonnanimi",
            "type" : "string",
            "filter" : false,
            "listShow" : true,
            "help" : "Perekonnanimi"
         }
      ]
   },
   {
      "name" : "ref:classifier",
      "label" : "Klassifikaator",
      "object" : "classifier",
      "table" : "main_resource",
      "key" : "main_resource_id",
      "fields" : [
         {
            "name" : "name",
            "label" : "Nimi",
            "type" : "string",
            "listShow" : true,
            "help" : "Klassifikaatori inimloetav nimi"
         }
      ]
   }
]
;

exports.viewdefs = viewdefs;
if (window) window.viewdefs = viewdefs;

})(typeof exports === 'undefined'? this.viewdefs = {} : exports);
