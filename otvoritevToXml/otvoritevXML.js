const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      util = require('util')
      Otvoritev = require('./otvoritev')
      stranke = require('./../data/strankeJSON')
      kontniPlan = require('./../data/kontniPlanJSON')



var workbook = XLSX.readFile(__dirname+'/../data/GK_KNJIZBA.xls');
var worksheet = workbook.Sheets.GK;
var headers = {};
var data = [];

for(z in worksheet){
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

var otvoritve = []

data.forEach((obj)=>{
  if(obj.SIMBOL === 7){
      otvoritve.push(obj)
  }
})


//console.log(otvoritve)
var zbirnikIzdani = {}
var zbirnikPrejeti = {}
var otvoritevXML = new Otvoritev()
otvoritevXML.addGlavaTemeljnice("2018-01-01", "OTVORITEV 2017")

otvoritve.forEach((postavka)=>{

  if(postavka.KONTO === '1200'){

    if(!zbirnikIzdani[postavka.PARTNER]){
      zbirnikIzdani[postavka.PARTNER] = {
        breme: postavka.DEBET
      }
    }else{
      zbirnikIzdani[postavka.PARTNER].breme += postavka.DEBET
    }
  }else if(postavka.KONTO === '2200'){

    if(!zbirnikPrejeti[postavka.PARTNER]){
      zbirnikPrejeti[postavka.PARTNER] = {
        dobro: postavka.KREDIT
      }
    }else{
      zbirnikPrejeti[postavka.PARTNER].dobro += postavka.KREDIT
    }
  }else{
    if(!kontniPlan[postavka.KONTO])console.log(postavka.KONTO)
    otvoritevXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)
  }

})




Object.keys(zbirnikIzdani).forEach((key)=>{
  otvoritevXML.addVrsticaTemeljnice("2018-01-01", "2018-01-01", "2018-01-01", stranke[key] && stranke[key].ID_DDV, "1200", parseFloat(zbirnikIzdani[key].breme).toFixed(2), "0", "ZBIRNIK", null, "OTVORITEV 2017 "+stranke[key].NAZIV)

})

Object.keys(zbirnikPrejeti).forEach((key)=>{
  otvoritevXML.addVrsticaTemeljnice("2018-01-01", "2018-01-01", "2018-01-01", stranke[key] && stranke[key].ID_DDV, "2200", "0", parseFloat(zbirnikPrejeti[key].dobro).toFixed(2), "ZBIRNIK", null, "OTVORITEV 2017 "+stranke[key].NAZIV)

})



console.log(otvoritevXML.toString())


function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
