const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      izdanRacun = require('./izdanracun')

var workbook = XLSX.readFile('data/GK_KNJIZBA.xls');
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

  if(obj.SIMBOL === 2 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() === 1){
    if(izdaniRacuni[obj.DOKUMENT])izdaniRacuni[obj.DOKUMENT].push(obj)
    else izdaniRacuni[obj.DOKUMENT] = [obj]
  }

})

console.log(izdaniRacuni);

console.log(Object.keys(izdaniRacuni).length)




function createInvoice(postavke, stRacuna, datum, dobro, breme, stranka){
  let xmlObj = new IzdanRacun()

  xmlobj.createObjectsFromMap((err)=>{
    let ddvVisoka = 0
    let ddvZnizana = 0
    let osnova = 0
    postavke.forEach((obj)=>{
      if(obj.konto === '7620')osnova = obj.dobro
      else if(obj.konto === '26000') ddvVisoka = obj.dobro
      else if(obj.konto === '26001') ddvZnizana = obj.dobro

      if(obj.dobro){
        xmlobj.addVrsticaTemeljnice({
          DatumKnjizbe: [ foramtDate(obj.datum) ],
          OpisVrsticeTemeljnice: [ 'IR: '+obj.veza ],
          SifraKonta: [ obj.konto ],
          ZnesekVDobroVDenarniEnoti: [ obj.dobro ],
          ZnesekVDobroVDomaciDenarniEnoti: [ obj.dobro ]
        })
      }
      else{
        xmlobj.addVrsticaTemeljnice({
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

    xmlobj.addGlavaTemeljnice({
      SifraVrsteTemeljnice: [ 'IR' ],
      DatumTemeljnice: [ foramtDate(datum) ],
      OpisGlaveTemeljnice: [ 'IR:'+foramtDate(datum) ]
    })


    xmlobj.addDDVTemeljnice({
       DatumDDV: [ foramtDate(datum) ],
       KnjigaDDV: [ 'IR' ],
       DatumKnjizenjaDDV: [ foramtDate(datum) ],
       SifraStranke: [ stranka ],
       Listina: [ 'IR: '+stRacuna ],
       DatumListine: [ foramtDate(datum) ]
    },[ddvVisoka !== 0 ? {
        SifraStopnjeDDV: [ 'S' ],
        Osnova: [ ddvVisoka/0.22 ],
        DDV: [ ddvVisoka ],
      }: null, ddvZnizana !== 0 ? {
        SifraStopnjeDDV: [ 'Z' ],
        Osnova: [  ],
        DDV: [ ddvZnizana/0.095 ],
      }: null])

    cb(xmlObj)
  })
}

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('DD-MM-YYYY')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
