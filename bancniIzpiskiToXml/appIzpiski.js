const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      BancniIzpisek = require('./bancniIzpisek')
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
let izpiski = {}
let counter = 1
data.forEach((obj)=>{

  if(obj.SIMBOL === 11 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() === 0 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).date() === 3 ){
    //console.log(moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)))
    if(izpiski[obj.DOKUMENT])izpiski[obj.DOKUMENT].push(obj)
    else izpiski[obj.DOKUMENT] = [obj]
  }

})


Object.keys(izpiski).forEach((key)=>{
  var bancniIzpisek= new BancniIzpisek()
  var opisTemeljnice = ""
  var datumtemeljnice = ""
  izpiski[key].forEach((postavka)=>{
    if(postavka.KONTO == '1200' || postavka.KONTO == '2200'){
      opisTemeljnice = "Adiko bank izpisek: "+postavka.DOKUMENT
      datumtemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
    }
    bancniIzpisek.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA),
                                        postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET,
                                        postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

  })
  bancniIzpisek.addGlavaTemeljnice(datumtemeljnice, opisTemeljnice)
  console.log(bancniIzpisek.toString())

})

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
