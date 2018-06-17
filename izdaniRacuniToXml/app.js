const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      IzdanRacun = require('./izdanracun')
      util = require('util')
      stranke = require('./../data/strankeJSON')
      kontniPlan = require('./../data/kontniPlanJSON')
      uvozeniIzdaniRacuni = require('./../data/uvozeniIzdaniRacuni')
      Uvoz = require('./../uvoz')

var workbook = XLSX.readFile('../data/Knjizbe.xls');
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

  if(obj.SIMBOL === 2 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() < 5){
    //console.log(moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)))
    if(izdaniRacuni[obj.DOKUMENT])izdaniRacuni[obj.DOKUMENT].push(obj)
    else izdaniRacuni[obj.DOKUMENT] = [obj]
  }

})


var obstojeci = 0
var neuneseni = 0
var uvoz = new Uvoz()
Object.keys(izdaniRacuni).forEach((key)=>{
  if(uvozeniIzdaniRacuni.includes(Number(key)))obstojeci++
  else{
    var izdanRacunXML = new IzdanRacun()
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    izdaniRacuni[key].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR-"+ postavka.DOKUMENT

      }
      izdanRacunXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })
    izdanRacunXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(izdanRacunXML.xmlObj)
    neuneseni++
  }
})

fs.writeFile('../Uvozi/izdaniRacuniUvoz.xml',uvoz.toString(),(err)=>{
  if(err)console.log(err)
})


console.log("Vseh racunov je %d/%d | Ne vnesenih racunov je %d | Ze vnesenih je %d/%d", Object.keys(izdaniRacuni).length, neuneseni+obstojeci,neuneseni, obstojeci,uvozeniIzdaniRacuni.length)

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
