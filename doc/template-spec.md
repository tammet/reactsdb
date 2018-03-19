# RIHA andmeobjektide kirjeldusmalli spetsifikatsioon

## Ülevaade

RIHA keskkonna poolt hallatavate andmeobjektide info koosseis areneb läbi aja. RIHA andmeobjektide kirjeldusmallid kirjeldavad vastavate objektiliikide väljade koosseisu. Mallid on versioneeritud - konkreetne malli versioon on fikseeritud ning täiendamisvajaduste korral tekitatakse mallist uus versioon.

Käesolevas dokumendis kirjeldadakse andmeformaat, mismoodi on mallikirjeldused RIHAs esitatud.

## Seotud dokumendid

## Mõisted

* RIHA - Riigi Infosüsteemi haldussüsteem (http://riha.eesti.ee/).
* JSON - JavaScript Object Notation - masintöödeldav andmete esitamise formaat, vt http://www.json.org/ spetsifitseeritud standardiga ECMA-404. 

## Kirjeldus

RIHA andmeobjektide kirjeldusmall (edaspidi lihtsalt - mall) esitatakse JSON formaadis.

Kõikjal antud dokumendis toodud mallikirjeldustes, kus on määratud objekti elemendile vaikeväärtus, on lubatud selle elemendi mallist välja jätmine ning
sellisel juhul on see tõlgendatav juhuga, kus element on esitatud selle vaikeväärtusega. Kui vaikeväärtuse koha peal on kirjas '-', siis
see tähendab, et vaikeväärtus puudub ning element tuleb alati esitada `null`-ist erineva väärtusega.


## Mallide kogum

RIHA objektide mallide kogum esitatakse objektina, millel on järgmised elemendid:

| Elementi nimi | Andmetüüp | Vaikeväärtus | Väärtuse kirjeldus
|---------------|-----------|--------------|--------------------
| name          | string    | -            | Mallikogumi inimloetav nimi, eristamaks seda teistest (tarkvara seda infot ei kasuta).
| version       | string    | -            | Malli versiooninumber.
| navbar        | array     | null         | Navigatsiooniriba sisu kirjeldus, vt allpool.
| objects       | object    | -            | Malliga hallatavate põhiobjektide kogum.

Põhiobjektide kogum kujutab endast võtme ja väärtuse paare, kus võtmeks on põhiobjekti tehniline nimi ning väärtuseks on objektiliigi malli objekt (vt punkt "Objektiliigi mall").

### Navigatsiooniriba kirjeldus (element "navbar")

Navigatsiooniriba kirjeldus esitatakse massiivina, kus iga element tähistab vastaval positsioonil olevat navigatsiooniriba elementi. Navigatsiooniriba elemendid on objektid, millel on järgmised elemendid:

| Elementi nimi | Andmetüüp | Vaikeväärtus     | Väärtuse kirjeldus
|---------------|-----------|------------------|--------------------
| name          | string    | -                | Objektiliigi tehniline nimi
| label         | string    | -                | Navigatsiooniribal kuvatav nimi
| component     | string    | "ViewObjectList" | Komponent, mille abil kuvatakse vastava menüüvaliku valimisel lehe sisu
| help          | string    | null             | Abiinfo, mis kuvatakse antud menüüvaliku valimisel avaneva lehe alguses

## Objektiliigi mall

Konkreetse objektiliigi mall esitatakse JSON objektina, millel on järgmised elemendid:

| Elementi nimi | Andmetüüp | Vaikeväärtus | Väärtuse kirjeldus
|---------------|-----------|--------------|--------------------
| name          | string    | -            | Objektiliigi tehniline nimi (st vastava objektiliigi "type" välja väärtus).
| label         | string    | -            | Objektiliigi inimloetav nimi, mis kuvatakse kasutajaliideses
| version       | string    | -            | Objektiliigi malli versioon
| table         | string    | null         | Kui on täidetud, siis tähendab, et seda objekti laetakse otse vastavast andmebaasitabelist, vastasel korral on objekt mingi teise objekti alamobjekt
| key           | string    | -            | Objektiliigi võtmevälja nimi
| isChild       | boolean   | false        | Kui "true", siis on tegemist RIHA põhiobjekti sees asuva alamobjektiga
| edit          | boolean   | true         | Kui "false", siis muutmistegevusi antud objektiliigi objektidega ei võimaldata
| sort          | boolean   | true         | Kui "false", siis objektide nimekirja sorteerimine pole lubatud
| filter        | boolean   | true         | Kui "false", siis objektide nimekirja alguses filtrivormi ei kuvata
| menu          | array     | null         | Kui esitatud, siis tekitatakse objekti vaatamislehe vasakusse serva külgmenüü ning antud elemendi väärtus määratleb menüüelementide nimed. Vt allpool.
| fields        | array     | -            | Andeväljade esituse määrangud. Vt allpool.
| component     | string    | "ViewObject" | Komponent, mille abil kuvatakse antud objektiliigi objekti vaatamise vaade.

Elemendid "menu" ja "groups" on lubatud esitada ainult selliste objektiliikide korral, mille elemendi "isChild" väärtus ei ole "true".

Märkus: Kasutajaliideses kasutatakse objektide nimekirja kuvamisel alati kõige viimase versiooni malli, seda ka objektide korral, mis on kirjeldatud
vanema versiooni malli abil. Kui kasutajaliideses avatakse objekt, mis on kirjeldatud vanema versiooni malliga, siis objekti kuvamisel kasutatakse
seda malli. Kui hakatakse muutma objekti, mis on esitatud varasema versiooni malliga, siis tarkvara teisendab objekti info viimase versiooni malli
peale ning kui kasutaja otsustab selle objekti salvestada, siis salvestatakse see juba viimase versiooni malliga.

### Külgmenüü sisu kirjeldus (element "menu")

Kui mallis on esitatud element "menu" ning selle väärtus pole `null`, siis tekitatakse objekti vaatamise lehele vasakusse serva menüü, mille
sisu koostatakse elemendi "menu" väärtuse baasilt. Kasutajal on võimalik valida erinevaid menüüvalikuid, menüüvaliku valimisel kuvatakse 
lehe sisuosas ainult need elemendid, mille kirjelduses langeb elemendi "menu" väärtus kokku valitud menüüvalikuga.

Elemendi "menu" sisu peab olema massiiv, mille iga element vastab ühele tekitatavale menüüvalikule. Massiivi elemendid on tüüpi "object" ning
sisaldavad järgmisi elemente:

| Elementi nimi | Andmetüüp | Vaikeväärtus            | Väärtuse kirjeldus
|---------------|-----------|-------------------------|--------------------
| name          | string    | -                       | Menüüvaliku URLis kasutatav nimi.
| label         | string    | "name" elemendi väärtus | Kasutajaliideses kuvatav menüüvaliku nimi.
| component     | string    | "ViewSection"           | Komponendi nimi, mille abil kuvatakse antud menüüvaliku korral lehe sisu.
| props         | string    | null                    | Kui esitatud, siis tegemist on HTTP query string süntaksis esitatud täiendava filtriga, mis tuleb komponendile edasi anda, et see kuvaks ainult vajaliku sisu.
| help          | string    | null                    | Kui esitatud, siis abiinfo, mis tuleb kuvada antud menüüvaliku korral lehe alguses.
| groups        | array     | -                       | Menüüvaliku all kuvatavate tabide nimekiri, vt järgmine punkt.

Kui mallis soovitakse kirjeldada sisu selliselt, et vasakpoolset menüüd pole, kuid lehe sisu ise on jagatud tabideks, siis
tuleb tekitada element "menu" selliselt, et selles on täpselt üks menüüvalik, millel on "name" ja "label" elemendid esitamata ning elemendis "groups" on esitatud tabide info.

### Tabide sisu kirjeldus (element "groups")


Kui mallis on elemendi "menu" all konkreetse menüü kirjelduses esitatud element "groups", siis antud menüüvaliku korral kuvatakse lehe sisu ülaosas tabid, mille sisu
määratakse antud elemendi abil. Elemendi "groups" sisu peab olema massiiv, mille iga element vastab ühele tekitatavale tabile. Massiivi "groups" elemendid on tüüpi "object" 
ning need sisaldavad järgmisi elemente:

| Elementi nimi | Andmetüüp | Vaikeväärtus            | Väärtuse kirjeldus
|---------------|-----------|-------------------------|--------------------
| name          | string    | -                       | Tabi URLis kasutatav nimi.
| label         | string    | "name" elemendi väärtus | Kasutajaliideses kuvatav tabi nimi.
| component     | string    | "ViewFields"            | Komponendi nimi, mille abil kuvatakse antud tabi sisu.
| props         | string    | null                    | Kui esitatud, siis tegemist on HTTP query string süntaksis esitatud komponendile etteantavate täiendavate parameetritega.
| help          | string    | null                    | Kui esitatud, siis abiinfo, mis tuleb kuvada antud tabi korral lehe alguses.

### Väljade kirjeldus (element "fields")

Elemendi "fields" abil kirjeldatakse kõik kasutatavad objektiliigi väljad. Kirjeldatud peavad olema ka sellised väljad, mida kasutajaliideses
välja ei kuvata, kuid objekti kirjelduses tahetakse esitada. Mallis mittekirjeldatud välju objekti JSON esituses ei lubata.

Element "fields" on tüüpi "array", mille iga element vastab ühele väljakirjeldusele. Väljakirjeldused on tüüpi "object" ning koosnevad
järgmistest elementidest:

| Elementi nimi | Andmetüüp | Vaikeväärtus         | Väärtuse kirjeldus
|---------------|-----------|----------------------|--------------------
| name          | string    | -                    | Välja tehniline nimi. Kui nimel on prefiks "virtual:", siis tegemist on väljaga, mida andmebaasi ei salvestata ning selle sisu pannakse kokku väljale määratud komponendi poolt.
| label         | string    | -                    | Välja nimi, mis kuvatakse kasutajaliideses. 
| type          | string    | "string"             | Välja andmetüüp, vt allpool.
| order         | integer   | null                 | Välja järjestuse määrang. Väljad järjestatakse kõigepealt antud välja vöörtuse järgi ning seejärel väljade mallis paiknemise järgi.
| group         | string    | null                 | Määrab elemendi kuulumise konkreetse menüüvaliku või tabi alla, vt allpool.
| ops           | array     | ["all"]              | Tegevused, kus antud väli on esindatud. Võimalikud variandid on: "all", "list", "view", "edit", "add", "filter", "extfilter".
| values        | array     | null                 | Kui esitatud ja pole `null`, siis määratleb lubatud väärtused antud väljale. Vt allpool.
| editWidget    | string    | sõltub välja tüübist | Välja esitamiseks kasutatava komponendi nimi, vt allpool.
| props         | string    | null                 | Välja esitamiseks kasutatavale komponendile antavad täiendavad parameetrid kodeerituna HTTP query stringina.
| help          | string    | null                 | Välja abitekst.


#### Välja andmetüüp (element "type")

Lubatavad on järgmised andmetüübi määrangud:

* "string" - välja väärtuseks on tekst
* "integer" - välja väärtuseks on täisarv
* "number" - välja vöörtuseks on ujukomaarv
* "money" - välja väärtuseks on rahaühik
* "boolean" - välja vöörtuseks on tõeväärtus (kas `true` või `false`)
* "date" - välja väärtuseks on kuupäev (ilma kellaajata)
* "time" - välja väärtuseks on kellaaeg
* "datetime" - välja vöörtuseks on kuupäev koos kellaajaga
* "base64" - välja väärtuseks on fail
* "array:{type}" - välja väärtuseks on massiiv, mille elemendid on näidatud tüüpi (kas lihttüüp või objektitüüp)
* "{objecttype}" - kõikide muude väärtuste korral eeldatakse, et väärtus {objecttype} on mallide kogumis kirjeldatud objekt. 
Sellise nimega objektikirjelduse mitteleidumise korral tekitatakse veateade.

#### Välja grupp (element "group")

Elemendi "group" väärtusega määratakse välja kuulumine menüüvaliku ja/või tabi alla. Elemendi väärtus esitatakse kujul `{menu}:{group}`, kus
`{menu}` peab sisaldama antud objekti menüü ühe konkreetse menüüvaliku nime (võib olla ka tühi, kui sellele objektitüübile menüüd pole
kirjeldatud) ning `{group}` peab sisaldama antud objekti tabide loetulust konkreetse tabi nime (võib olla ka tühi, kui sellele objektitüübile
pole tabe kirjeldatud).

#### Välja väärtuste loend (element "values")

Selle elemendi abil määratletakse välja väärtustamise piirangud. Elemendi väärtus peab olema tüüpi "array" ning sisaldama kas lihtväärtusi (mille 
andmetüüp peab kokku langema välja enda andmetüübiga) või kaheelemendilisi massiive, millest esimene element on lihtväärtus ning teine tekst. Teisel 
juhul kasutatakse teksti valikväärtuse kuvamisel kasutajaliideses ning selle väärtuse valimisel määratakse välja väärtuseks toodud lihtväärtus.

#### Välja muutmiskomponent (element "editWidget")

Selle elemendi abil määratakse ära kasutajaliideses välja väärtuse muutmiseks kasutatav komponent. Saab olla üks järgmistest:

* "text" - Väärtuse muutmiseks kuvatakse teksti sisestamise väli. Kasutaja poolt sisestatud väärtus omistatakse välja väärtuseks.
* "checkbox" - Väärtuse muutmiseks kuvatakse linnutatav väli. Kui väljale on kirjeldatud element "values", siis linnutamata jätmine vastab
esimesele valikvälja väärtusele ning linnutamine vastab teisele valikvälja väärtusele. Kui elementi "values" pole kirjeldatud, siis sõltub
omistatav väärtus välja andmetüübist:
  * "string", "integer", "number", "money" andmetüüpide korral väärtus `0` mitte linnutatuse korral ning väärtus `1` linnutamise korral
  * "boolean" andmetüübi korral väärtus `false` mitte linnutatuse korral ning väärtus `true` linnutamise korral
  * muude andmetüüpide korral pole lubatud kasutada
* "select" - Kuvatakse valikuväli, kus lubatavad väärtused peavad olema määratud elemendi "values" abil
* "file" - Kuvatakse faili üleslaadimise väli. Seda komponenti saab kasutada ainult juhul, kui välja andmetüüp on "base64".
* "textarea" - Kuvatakse mitmerealine tekstiväli.
* "date" - Kuvatakse teksti sisestamise väli, millele on külge haagitud kuupäeva valimise aken.

## Malli näide

```
{
	
}
```

