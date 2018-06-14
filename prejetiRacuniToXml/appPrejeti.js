const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      PrejetRacun = require('./prejetRacun').PrejetRacun
      PrejetiRacuni = require('./prejetRacun').PrejetiRacuni
      util = require('util')
      stranke = require('./../data/strankeJSON')
      kontniPlan = require('./../data/kontniPlanJSON')

var workbook = XLSX.readFile('../data/GK_KNJIZBA.xls');
var worksheet = workbook.Sheets.GK;
var headers = {};
var data = [];
for(z in worksheet) {
   if(z[0] === '!') continue;
   //parse out the column, row, and value
   var col = z.substring(0,1);
   var row = parseInt(z.substring(1));
   var value = worksheet[z].v;

   //store header names
   if(row == 1) {
       headers[col] = value;
       continue;
   }

   if(!data[row]) data[row]={};

   data[row][headers[col]] = value;

}
//drop those first two rows which are empty
data.shift();
data.shift();

//let izdaniRacuni = data.filter((obj)=> obj.SIMBOL === 2)
let prejetiRacuni = {}
let counter = 1
data.forEach((obj)=>{

  if(obj.SIMBOL === 9 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() === 0 ){
    //console.log(moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)))
    if(prejetiRacuni[obj.DOKUMENT])prejetiRacuni[obj.DOKUMENT].push(obj)
    else prejetiRacuni[obj.DOKUMENT] = [obj]
  }

})

var prejetiRacuniXML = new PrejetiRacuni()
Object.keys(prejetiRacuni).forEach((key)=>{
  var prejetRacun = new PrejetRacun()
  var opisTemeljnice = ""
  var datumtemeljnice = ""
  prejetiRacuni[key].forEach((postavka)=>{
    if(postavka.KONTO == '1200' || postavka.KONTO == '2200'){
      opisTemeljnice = "PR: "+postavka.DOKUMENT
      datumtemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
    }
    prejetRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA),
                                      postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA),
                                      postavka.DATUM_DOKUMENTA,
                                      stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV,
                                      kontniPlan[postavka.KONTO],
                                      parseFloat(postavka.DEBET).toFixed(2),
                                      parseFloat(postavka.KREDIT).toFixed(2),
                                      postavka.VEZA,
                                      postavka.ID_KNJIZBA,
                                      postavka.OPIS_DOKUMENTA)


  })
  prejetRacun.addGlavaTemeljnice(datumtemeljnice, opisTemeljnice)

  prejetiRacuniXML.addPrejetRacun(prejetRacun)
})


console.log(prejetiRacuniXML.toString());

/*

  postavke = [{
    veza: string,
    dobro: num,
    breme: num,
    datum: string,
    datum_valute: string,
    starnka: string,
    konto: string
  }]


function createInvoice(postavke, stRacuna, datum, stranka, cb){
  var xmlObj = new IzdanRacun()
  xmlObj.createObjectsFromMap((err)=>{
    let ddvVisoka = 0
    let ddvZnizana = 0
    let osnova = 0
    postavke.forEach((obj)=>{
      if(obj.konto === '7620')osnova = obj.dobro
      else if(obj.konto === '26000') ddvVisoka = obj.dobro
      else if(obj.konto === '26001') ddvZnizana = obj.dobro

      if(obj.dobro){
        xmlObj.addVrsticaTemeljnice({
          DatumKnjizbe: [ foramtDate(obj.datum) ],
          OpisVrsticeTemeljnice: [ 'IR: '+obj.veza ],
          SifraKonta: [ obj.konto ],
          ZnesekVDobroVDenarniEnoti: [ obj.dobro ],
          ZnesekVDobroVDomaciDenarniEnoti: [ obj.dobro ]
        })
      }
      else{
        xmlObj.addVrsticaTemeljnice({
          DatumKnjizbe: [ foramtDate(obj.datum) ],
          OpisVrsticeTemeljnice: [ 'IR: '+obj.veza ],
          SifraKonta: [ obj.konto ],
          SifraStranke: [ obj.stranka ],
          DatumZapadlosti: [ foramtDate(obj.datum_valute) ],
          DatumOpravljanja: [ foramtDate(obj.datum) ],
          VezaZaPlacilo: [ obj.veza ],
          ZnesekVBremeVDenarniEnoti: [ obj.breme ],
          ZnesekVBremeVDomaciDenarniEnoti: [ obj.breme ]
        })
      }
    })

    xmlObj.addGlavaTemeljnice({
      SifraVrsteTemeljnice: [ 'IR' ],
      DatumTemeljnice: [ foramtDate(datum) ],
      OpisGlaveTemeljnice: [ 'IR:'+foramtDate(datum) ]
    })


    xmlObj.addDDVTemeljnice({
       DatumDDV: [ foramtDate(datum) ],
       KnjigaDDV: [ 'IR' ],
       DatumKnjizenjaDDV: [ foramtDate(datum) ],
       SifraStranke: [ stranka ],
       Listina: [ 'IR: '+stRacuna ],
       DatumListine: [ foramtDate(datum) ]
    },[ddvVisoka !== 0 ? {
        SifraStopnjeDDV: [ 'S' ],
        Osnova: [ (ddvVisoka/0.22).toFixed(2) ],
        DDV: [ ddvVisoka ],
      }: null, ddvZnizana !== 0 ? {
        SifraStopnjeDDV: [ 'Z' ],
        Osnova: [ (ddvZnizana/0.095).toFixed(2) ],
        DDV: [ ddvZnizana],
      }: null])

    //console.log(xmlObj.xmlobjmap)
    cb(xmlObj)
  })
}
*/

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
