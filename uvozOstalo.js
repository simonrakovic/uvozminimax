const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      xml2js = require('xml2js')
      util = require('util')
      stranke = require('./data/strankeJSON')
      kontniPlan = require('./data/kontniPlanJSON')
      uvozeniIzdaniRacuni = require('./data/uvozeniIzdaniRacuni')
      Uvoz = require('./uvoz')
      parser = new xml2js.Parser();
      builder = new xml2js.Builder({headless: true});



class Temeljnica{
  constructor(){
    this.type = "FT"
    this.xmlObj = {
        GlavaTemeljnice:[],
        VrsticeTemeljnice:[{
          VrsticaTemeljnice:[]
        }]
      }

  }

  addGlavaTemeljnice(datum, opis){
    if(moment(datum, 'YYYY-MM-DD').year() !== moment(Date.now()).year())datum = "2018-01-01"
    this.xmlObj.GlavaTemeljnice.push({
                          SifraVrsteTemeljnice:this.type ,
                          DatumTemeljnice: datum ,
                          OpisGlaveTemeljnice: opis
                        })
  }

  addVrsticaTemeljnice(datum, datum_zapadlosti, datum_opravljanja, stranka, konto, breme, dobro, veza, id_knjizbe, opis){
    if(!Number(stranka) && stranka)stranka = "0"+Number(stranka.replace(/\D/g,''))
    if(Number(stranka) !== 0 && Number(dobro) !== 0){
      this.xmlObj.VrsticeTemeljnice[0].VrsticaTemeljnice.push({
        DatumKnjizbe: datum,
        OpisVrsticeTemeljnice: opis ,
        SifraKonta: konto,
        SifraStranke: stranka ,
        DatumZapadlosti: datum_zapadlosti ,
        DatumOpravljanja: datum,
        VezaZaPlacilo: veza,
        ZnesekVDobroVDenarniEnoti: dobro,
        ZnesekVDobroVDomaciDenarniEnoti: dobro,
        StevilkaKnjizbe: id_knjizbe
      })

    }else if(Number(stranka) !== 0 && Number(breme) !== 0){
      this.xmlObj.VrsticeTemeljnice[0].VrsticaTemeljnice.push({
        DatumKnjizbe: datum,
        OpisVrsticeTemeljnice: opis ,
        SifraKonta: konto,
        SifraStranke: stranka ,
        DatumZapadlosti: datum_zapadlosti ,
        DatumOpravljanja: datum,
        VezaZaPlacilo: veza,
        ZnesekVBremeVDenarniEnoti: breme,
        ZnesekVBremeVDomaciDenarniEnoti: breme,
        StevilkaKnjizbe: id_knjizbe
      })

    }else if(Number(stranka) === 0 && Number(dobro) !== 0){
      this.xmlObj.VrsticeTemeljnice[0].VrsticaTemeljnice.push({
        DatumKnjizbe: datum,
        OpisVrsticeTemeljnice: opis ,
        SifraKonta: konto,
        ZnesekVDobroVDenarniEnoti: dobro,
        ZnesekVDobroVDomaciDenarniEnoti: dobro,
      })
    }else if(Number(stranka) === 0 && Number(breme) !== 0 ){

      this.xmlObj.VrsticeTemeljnice[0].VrsticaTemeljnice.push({
        DatumKnjizbe: datum,
        OpisVrsticeTemeljnice: opis ,
        SifraKonta: konto,
        ZnesekVBremeVDenarniEnoti: breme,
        ZnesekVBremeVDomaciDenarniEnoti: breme,
      })
    }else{
      console.log("UPS!! prislo je do izjeme "+opis)
      console.log(stranka+"|"+breme+"|"+dobro)
      console.log("________________________________")

    }

  }


  toString(){

    return builder.buildObject(this.xmlObj);
  }
}



var workbook = XLSX.readFile('data/Knjizbe.xls');
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
let place = {}
let temeljnice = {}
let kompenzacije = {}
let eracuni = {}
let najemnine = {}

let counterPlace = 1
let counterTemeljnice = 1
let counterKompenzacije = 1
let counterEracuni = 1
let counterNajemnine = 1

data.forEach((obj)=>{

  if(obj.SIMBOL === 4 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() > 5){
    if(eracuni[obj.DOKUMENT])eracuni[obj.DOKUMENT].push(obj)
    else eracuni[obj.DOKUMENT] = [obj]

  }else if(obj.SIMBOL === 6 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() > 5){
    if(place[obj.DOKUMENT])place[obj.DOKUMENT].push(obj)
    else place[obj.DOKUMENT] = [obj]

  }else if(obj.SIMBOL === 16 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() > 5){
    if(kompenzacije[obj.DOKUMENT])kompenzacije[obj.DOKUMENT].push(obj)
    else kompenzacije[obj.DOKUMENT] = [obj]

  }else if(obj.SIMBOL === 5 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() > 5){
    if(temeljnice[obj.DOKUMENT])temeljnice[obj.DOKUMENT].push(obj)
    else temeljnice[obj.DOKUMENT] = [obj]

  }else if(obj.SIMBOL === 10 && moment(ExcelDateToJSDate(obj.DATUM_DOKUMENTA)).month() > 5){
    if(najemnine[obj.DOKUMENT])najemnine[obj.DOKUMENT].push(obj)
    else najemnine[obj.DOKUMENT] = [obj]
  }
})

var uvoz = new Uvoz()
Object.keys(place).forEach((key)=>{

    var placeXML = new Temeljnica()
    placeXML.type = "OP"
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    place[key].forEach((postavka)=>{
      datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
      opisTemeljnice = "PLAČA "+postavka.DOKUMENT
      if(postavka.KONTO !== "2500"){
        if(!kontniPlan[postavka.KONTO])console.log("Konto "+postavka.KONTO+" ne obstaja!")
        placeXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)
      }


    })
    placeXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(placeXML.xmlObj)
    counterPlace++
})

Object.keys(temeljnice).forEach((key)=>{

    var temeljniceXML = new Temeljnica()
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    temeljnice[key].forEach((postavka)=>{
      datumTemeljnice =  moment(foramtDate(postavka.DATUM_DOKUMENTA)).year() === moment(Date.now()).year() ? foramtDate(postavka.DATUM_DOKUMENTA): "2018-01-01"
      opisTemeljnice = postavka.DOKUMENT
      if(!kontniPlan[postavka.KONTO])console.log("Konto "+postavka.KONTO+" ne obstaja!")
      temeljniceXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })
    temeljniceXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(temeljniceXML.xmlObj)
    counterTemeljnice++
})

Object.keys(kompenzacije).forEach((key)=>{

    var kompenzacijeXML = new Temeljnica()
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    kompenzacije[key].forEach((postavka)=>{
      datumTemeljnice =  moment(foramtDate(postavka.DATUM_DOKUMENTA)).year() === moment(Date.now()).year() ? foramtDate(postavka.DATUM_DOKUMENTA): "2018-01-01"
      opisTemeljnice = postavka.OPIS_DOKUMENT
      if(!kontniPlan[postavka.KONTO])console.log("Konto "+postavka.KONTO+" ne obstaja!")
      kompenzacijeXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })
    kompenzacijeXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(kompenzacijeXML.xmlObj)
    counterKompenzacije++
})

Object.keys(eracuni).forEach((key)=>{

    var eracuniXML = new Temeljnica()
    eracuniXML.type = "IR"
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    eracuni[key].forEach((postavka)=>{
      datumTemeljnice =  moment(foramtDate(postavka.DATUM_DOKUMENTA)).year() === moment(Date.now()).year() ? foramtDate(postavka.DATUM_DOKUMENTA): "2018-01-01"
      opisTemeljnice = "e-racun: "+postavka.DOKUMENT
      if(!kontniPlan[postavka.KONTO])console.log("Konto "+postavka.KONTO+" ne obstaja!")
      eracuniXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })
    eracuniXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(eracuniXML.xmlObj)
    counterEracuni++
})

Object.keys(najemnine).forEach((key)=>{

    var najemnineXML = new Temeljnica()

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    najemnine[key].forEach((postavka)=>{
      datumTemeljnice =  moment(foramtDate(postavka.DATUM_DOKUMENTA)).year() === moment(Date.now()).year() ? foramtDate(postavka.DATUM_DOKUMENTA): "2018-01-01"
      opisTemeljnice = "NAJEMNINE "+postavka.DOKUMENT
      if(!kontniPlan[postavka.KONTO])console.log("Konto "+postavka.KONTO+" ne obstaja!")
      najemnineXML.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })
    najemnineXML.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(najemnineXML.xmlObj)
    counterNajemnine++
})

fs.writeFile('Uvozi/preostaleTemeljnice.xml', uvoz.toString(),(err)=>{
  if(err)console.log(err)
})


console.log("Vseh temeljnic je %d | Vseh plac je %d | Vseh temeljnic je %d | Vseh kompenzacij je %d | Vseh eracunov je %d | Vseh najemnin je %d |",
            counterPlace+counterEracuni+counterNajemnine+counterTemeljnice+counterKompenzacije,
            counterPlace,
            counterTemeljnice,
            counterKompenzacije,
            counterEracuni,
            counterNajemnine)

function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
