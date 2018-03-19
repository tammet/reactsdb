var templateInfo = {
	// Mallide komplekti inimloetav nimi. UI-s ei kasutata
	"name" : "Vana RIHA mall",
	
	// Mallide komplekti versioon.
	// Objektide listide kuvas rakendatakse kas malli, mis oli kasutuses selle objektilisti vanemobjektil või siis
	// RIHA põhiobjektide korral kõige viimase versiooniga malli. Konkreetse objekti kuvamisel aga võetakse
	// aluseks mall, mille versioon vastab objekti juures näidatud malli versioonile.
	"version" : "1.0.0",
	"navbar" : [
	    {
	    	// Template nimi (templates.name), mis tuleb antud navbari lingi korral avada (pannakse URLi).
	    	"name" : "infosystem",
	    	
	    	// Navbaris välja kuvatav tekst (lastakse läbi tõlke) või tõlgete massiiv (valitakse õige tõlge)
	    	"label" : "Infosüsteem"
	    }
	],
	"templates" : [
	     {
	    	 // Template tehniline nimi
	    	 // Reguleeritud on, et iga RIHA objekti korral peab leiduma alati mall, mille nimi langeb kokku 
	    	 // põhiobjekti nimega, ning seda malli kasutatakse vaikimisi objekti vaate kuvamisel juhtuel, kus mall pole ilmutatult määratud.
	    	 "name" : "infosystem",
	    	 
	    	 // Template inimloetav nimi (kuvatakse lehe alguses?)
	    	 "label" : "Infosüsteemid",
	    	 
	    	 // Tavaliselt puudub. Kui on toodud, siis tuleb vaikimisi kasutatava standardkomponendi asemel kasutada näidatud komponenti
	    	 // lehe sisu kuvamiseks. Võimaldab realiseerida spetsiifiliste, standardist kõrvale kalduvate lehtede kuva.
	    	 // Seda välja kasutatakse ka sisust tuleneva korrektse komponendi valimiseks - näiteks, kui menüüvalikga avatavas
	    	 // lehes tuleb kuvada konkreetse objekti sisu asemel nimekiri objektidest, siis siin näidatakse vastava komponendi nimi.
	    	 "component" : "pageComponent",
	    	 
	    	 // Template'ga seotud RIHA objekt. Peab olema tingimata esitatud juhul, kui leht kuvatakse standardkomponendi abil
	    	 // (st välja "component" pole esitatud). Vastasel korral sõltub komponendist, kas see peab olema esitatud.
	    	 "object" : "infosystem",
	    	 
	    	 // Andmebaasitabel, kust loetakse väljaga "object" näidatud RIHA objekti info.
	    	 "table" : "main_resource",
	    	 
	    	 // Andmebaasitabeli võtmevälja nimi, mida tuleb kasutada RIHA objekti ID väärtusega konkreetse kirje leidmiseks.
	    	 "key" : "main_resource_id",
	    	 
	    	 // Antud malliga lehe vasakus servas kuvatav menüü. Kui seda välja pole esitatud, siis menüüd ei kuvata.
	    	 "menu": [
	    	     {
	    	    	 // Menüü tehniline nimi (pannakse URLi)
	    	    	 "name" : "services",
	    	    	 
	    	    	 // Menüü inimloetav nimi, mis kuvatakse välja menüüs
	    	    	 "label" : "Teenused",
	    	    	 
	    	    	 // Mall, mida rakendatakse lehe kuvale, kui antud menüüvalik kasutaja poolt valitakse.
	    	    	 // Mall asendab vana malli (kaasa arvatud vasaku menüü). Malli nimi lisatakse ka URLi.
	    	    	 "template" : "infosystem_service",
	    	    	 
	    	    	 // Mallile propsidega edasiantav objektide piirangu info. Piirang esitatakse HTTP query string kujul,kus 
	    	    	 // võrdusmärgist vasakul pool on objekti välja nimi ning paremal pool on kas konstantne väärtus või siis
	    	    	 // vanemobjekti välja nimi, esitatuna kujul "{vanemobjekti_väli}" (st - välja nimi on loogeliste sulgude sees).
	    	    	 // Piirangu abil piiratakse objektide listi, mida antud menüüvaliku mall kuvab.
	    	    	 // Samuti rakendatakse esitatud piirang antud menüüvaliku mallis uue objekti lisamisele ja olemasoleva muutmisele
	    	    	 // (st - neid välju kasutajal muuta ei lubata ja väärtuseks saab alati piirangus näidatu).
	    	    	 "restriction" : "main_resource_parent_id={main_resource_id}&service_type=mitteelektrooniline_teenus"
	    	     }
	    	 ],
	    	 
	    	 // Menüüvalik, mis tuleb antud malli korral kuvada valituna.
	    	 "menuSelectedItem" : "general",
	    	 
	    	 // Kui see väli on esitatud, siis esitatakse lehe sisus väljad tabidena. Kasutatakse ainut juhul, kui tegemist on konkreetse objekti
	    	 // vaatamise kuvaga.
	    	 "groups" : [
	    	     {
	    	    	 // Grupi tehniline nimi. Määratleb, et antud tabi all kuvatakse kõik väljad, millel on "group" välja väärtus 
	    	    	 // võrdne antud välja väärtusega.
	    	    	 "name" : "main",
	    	    	 
	    	    	 // Grupi inimloetav nimi, mis kuvatakse tabi nimeks
	    	    	 "label" : "Põhiinfo"
	    	     }
	    	 ],
	    	 
	    	 // Malliga kuvatavate väljade nimekiri
	    	 "fields" : [
	             {
	                 // Välja tehniline nimi
	                 "name" : "name",
	                   
	                 // Välja inimloetav nimi
	                 "label" : "Nimi",
	                   
	                 // Välja andmetüüp. Andmetüübiks võib olla ka RIHA objekti nimi või "array:{andmetüüp}"
	                 "type" : "string",
	                   
	                 // Väljale omistatud grupp. Kui mallis on kirjedatud grupid, siis tuleb antud väli paigutada kuvas vastava grupi alla.
	                 "group" : "main",
	                   
	                 // Välja järjekorranumber. Väljad esitatakse kuvas kõigepealt järjekorranumbri järgi ning seejärel esitatakse kõik
	                 // muud väljad (mis antud kohas tuleks kuvada) mallis väljade äratoomise järjekorras. 
	                 "order" : "3",
	                 
	                 // Ei kuvata filtris:
	                 "filter" : false,
	                 // Ei kuvata laiendatud filtris:
	                 "extfilter" : false,
	                 // Ei kuvata nimekirjas:
	                 "listShow" : false,
	                 // Ei kuvata muutmisel:
	                 "editShow" : false,
	                 // Ei kuvata vaatamisel:
	                 "viewShow" : false,
	                 // Ei kuvata lisamisel:
	                 "addShow" : false,
	                 
	                 // Kui esitatud, siis määratleb väljal lubatavate väärtuste loetelu. Väärtuste loetelu iga element esitab 
	                 // väärtuse ja sellele vastava inimloetava nime paari.
	                 // Välja väärtuse kuvamisel tuleb väärtuse asemel kuvada sellele vastav nimi ja muutmisel tuleb lubada valida
	                 // ainult esitatud väärtuste vahel.
	                 // Cehckbox korral määratleb esimene element sisselülitamata oleku ning teine element sisselülitatud oleku. Checkbox
	                 // korral väärtuse elementide inimloetavaid nimesid ignoreeritakse. 
	                 "values" : [
	                     [ "name", "Label" ] 
	                 ],
	                 
	                 // Kui esitatud, siis määratleb komponendi, mida tuleb kasutada antud välja muutmisel
	                 "editWidget" : "password",
	                 
	                 // Kui tegemist on objektitüüpi või objektide massiivi tüüpi väljaga, siis mall, mida tuleb kasutada selle välja sisu kuvamiseks.
	                 "template" : "mall",
	                   
	                 // Välja juurde kuvatav abiinfo.
	                 "help" : "Infosüsteemi inimloetav nimi"
	             }
	         ]
	     }
	]
};
