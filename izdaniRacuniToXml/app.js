const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      IzdanRacun = require('./izdanracun')
      util = require('util')
      stranke = require('./../data/strankeJSON')

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
let izdaniRacuni = {}
let counter = 1
data.forEach((obj)=>{

  if(obj.SIMBOL === 2 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() === 0 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).date() === 1){
    //console.log(moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)))
    if(izdaniRacuni[obj.DOKUMENT])izdaniRacuni[obj.DOKUMENT].push(obj)
    else izdaniRacuni[obj.DOKUMENT] = [obj]
  }

})


Object.keys(izdaniRacuni).forEach((key)=>{
  let postavke = []
  let datum = ""
  let stRacuna = ""
  let stranka = ""

  izdaniRacuni[key].forEach((postavka)=>{

    if(postavka.KONTO === '1200'){
      datum = postavka.DATUM_DOKUMENTA
      stRacuna = postavka.DOKUMENT
      stranka = stranke[postavka.PARTNER].ID_DDV
    }

    postavke.push({
      veza: postavka.DOKUMENT,
      dobro: Math.abs(postavka.KREDIT),
      breme: Math.abs(postavka.DEBET),
      datum: postavka.DATUM_DOKUMENTA,
      datum_valute: postavka.ROK_PLACILA,
      stranka: stranke[postavka.PARTNER] ? stranke[postavka.PARTNER].ID_DDV: "0",
      konto: postavka.KONTO,
    })
  })

  createInvoice(postavke, stRacuna, datum, stranka,(result)=>{
    console.log(result.toString())
  })
})


//console.log(izdaniRacuni);




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
*/

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

    /*
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
      */
    //console.log(xmlObj.xmlobjmap)
    cb(xmlObj)
  })
}

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
