const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      util = require('util')
      Otvoritev = require('./otvoritev')
      stranke = require('./../data/strankeJSON')
      kontniPlan = require('./../data/kontniPlanJSON')



var workbook = XLSX.readFile(__dirname+'/../data/Knjizbe.xls');
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
var zbirnikNepovezaneTerjatve = {}

var otvoritevXML = new Otvoritev()
otvoritevXML.addGlavaTemeljnice("2018-01-01", "OTVORITEV 2018")

otvoritve.forEach((postavka)=>{

  if(postavka.KONTO === '1200'){

    if(!zbirnikIzdani[postavka.PARTNER] && postavka.DEBET && !postavka.KREDIT){
      zbirnikIzdani[postavka.PARTNER] = {
        breme: postavka.DEBET
      }
    }else if(postavka.DEBET && !postavka.KREDIT){
      zbirnikIzdani[postavka.PARTNER].breme += postavka.DEBET
    }else{
      if(!zbirnikNepovezaneTerjatve[postavka.PARTNER]){

        zbirnikNepovezaneTerjatve[postavka.PARTNER] = {
          [postavka.OPIS_DOKUMENTA]: {
            dobro: postavka.KREDIT,
            breme: postavka.DEBET,
            datum: postavka.DATUM_DOKUMENTA
          }
        }
      }else{
        if(!zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA]){
          zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA] = {
              dobro: postavka.KREDIT,
              breme: postavka.DEBET,
              datum: postavka.DATUM_DOKUMENTA

          }
        }else{
          zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA].dobro += postavka.KREDIT
          zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA].breme += postavka.DEBET
          if(zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA] > postavka.DATUM_DOKUMENTA) zbirnikNepovezaneTerjatve[postavka.PARTNER][postavka.OPIS_DOKUMENTA].datum = postavka.DATUM_DOKUMENTA
        }
      }
    }
  }else if(postavka.KONTO === '2200'){

    if(!zbirnikPrejeti[postavka.PARTNER]){
      zbirnikPrejeti[postavka.PARTNER] = {
        dobro: postavka.KREDIT,

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
  otvoritevXML.addVrsticaTemeljnice("2018-01-01", "2018-01-01", "2018-01-01", stranke[key] && stranke[key].ID_DDV, "1200", parseFloat(zbirnikIzdani[key].breme).toFixed(2), "0", "ZBIRNIK", null, "OTVORITEV 2018 "+stranke[key].NAZIV)

})

Object.keys(zbirnikPrejeti).forEach((key)=>{
  otvoritevXML.addVrsticaTemeljnice("2018-01-01", "2018-01-01", "2018-01-01", stranke[key] && stranke[key].ID_DDV, "2200", "0", parseFloat(zbirnikPrejeti[key].dobro).toFixed(2), "ZBIRNIK", null, "OTVORITEV 2018 "+stranke[key].NAZIV)

})
var counter = 0
Object.keys(zbirnikNepovezaneTerjatve).forEach((keyStranka)=>{
  //console.log(zbirnikNepovezaneTerjatve[keyStranka])
  Object.keys(zbirnikNepovezaneTerjatve[keyStranka]).forEach((keyZbirnik)=>{
    counter += zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].dobro
    otvoritevXML.addVrsticaTemeljnice(foramtDate(zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].datum), foramtDate(zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].datum), foramtDate(zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].datum), stranke[keyStranka] && stranke[keyStranka].ID_DDV, "1200", parseFloat(zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].breme).toFixed(2), parseFloat(zbirnikNepovezaneTerjatve[keyStranka][keyZbirnik].dobro).toFixed(2), "ZBIRNIK", null, keyZbirnik)

  })

})



console.log(otvoritevXML.toString())


function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
