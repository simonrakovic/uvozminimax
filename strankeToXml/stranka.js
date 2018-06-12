const fs = require('fs'),
      xml2js = require('xml2js');
      parser = new xml2js.Parser();
      builder = new xml2js.Builder({headless: true});
      XLSX = require('xlsx');
      stranke = require('./../data/strankeJSON')

class Stranke{

  constructor(){


    this.objXml = {

           miniMAXUvozKnjigovodstvo:{
              '$':{ xmlns: 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo',
                  'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                  'xsi:schemaLocation': 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo.xsd' },
               Stranke: [
                 {
                   Stranka:[]
                 }
               ]
             }

         }



  }


  addStranka(stranka){
    this.objXml.miniMAXUvozKnjigovodstvo.Stranke[0].Stranka.push(stranka)
  }


  toString(){
    return builder.buildObject(this.objXml);
  }
}

class Stranka{
  constructor(sifra, naziv, nasolv, kraticaDrzave, postnaStevilka, nazivPoste, davcnaStevilka, identifikacijskaStevilka){
    this.data = {
      Sifra: sifra,
      Naziv: naziv,
      Naslov: nasolv,
      KraticaDrzave: kraticaDrzave,
      PostnaStevilka: postnaStevilka,
      NazivPoste: nazivPoste,
      DavcnaStevilka: davcnaStevilka,
      IdentifikacijskaStevilka: identifikacijskaStevilka,
    }
  }
}


//console.log(stranke)


module.exports = Stranke


/*

////////////BRANJE PODATKOV IZ EXELOVE TABELE
var workbook = XLSX.readFile('../data/stranke.xls');
var worksheet = workbook.Sheets.Sheet1;
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



var stranke = {}

data.forEach((stranka)=>{
  stranke[stranka.PARTNER] =  stranka
})


//// ISKANJE NALSOVOV STRANK PREKO BAZE PODATKJOV VSEH REGISTRERANIH PODJETJI
GlobalCustomer = require("./../GlobalCustomer")
db =  require("./../db")
var counter = 0
Object.keys(stranke).forEach((key)=>{

  GlobalCustomer.findOne({vat: stranke[key].ID_DDV},(err, customer)=>{
    if(customer){
      stranke[key].KRAJ = customer.city.trim()
      stranke[key].POSTA = customer.postal_num.trim()
      stranke[key].NASLOV = customer.address.trim()
    }else{
      stranke[key].KRAJ = ""
      stranke[key].POSTA = ""
      stranke[key].NASLOV = ""
    }
    counter++
    if(counter === Object.keys(stranke).length)console.log(JSON.stringify(stranke))
  })
})
*/



////////////BRANJE PODATKOV IZ EXELOVE TABELE
var workbook = XLSX.readFile('../data/stranke2.xls');
var worksheet = workbook.Sheets.Sheet1;
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



var strankeXML = new Stranke()

//console.log(data)
data.forEach((stranka)=>{

  if(stranka.DRZAVA !== "SLOVENIJA" && stranka.DRZAVA){

    var tmp = stranka.POSTA && stranka.POSTA.trim()

    var postna_stevilka = tmp ?(tmp.split(" ").length > 1 ? tmp.split(" ")[0] : "1000"):"1000"

    var posta = tmp ? tmp.replace(postna_stevilka, ""):"NI ZANANO"


    var id_ddv = stranka.ID_DDV && Number(stranka.ID_DDV.toString().replace(/\D/g,''))+""
    if(stranka.lenghth === 8)id_ddv += "0"


    var strankaXML = new Stranka(id_ddv, stranka.NAZIV, stranka.NASLOV ? stranka.NASLOV:"NI ZNANO", stranka.DRZAVA_KRATICA, postna_stevilka, posta, id_ddv, id_ddv)

    strankeXML.addStranka(strankaXML.data)
  }

})
console.log(strankeXML.toString())

/*
let xmlobj = new Stranke()
xmlobj.createObjectsFromMap((err)=>{
  xmlobj.addStranka({
      Sifra: [ '12345678' ],
      Naziv: [ 'OBI d.o.o' ],
      Naslov: [ 'Cesta na naklo 12' ],
      KraticaDrzave: [ 'SI' ],
      PostnaStevilka: [ '1000' ],
      NazivPoste: [ 'Ljubljana' ],
      DavcniZavezanec: [ 'D' ],
      DavcnaStevilka: [ 'SI12345678' ],
      IdentifikacijskaStevilka: [ '12345678' ],
      DneviZaZapadlost: [ '8' ],
  })
  xmlobj.addStranka({
      Sifra: [ '12345678' ],
      Naziv: [ 'OBI d.o.o' ],
      Naslov: [ 'Cesta na naklo 12' ],
      KraticaDrzave: [ 'SI' ],
      PostnaStevilka: [ '1000' ],
      NazivPoste: [ 'Ljubljana' ],
      DavcniZavezanec: [ 'D' ],
      DavcnaStevilka: [ 'SI12345678' ],
      IdentifikacijskaStevilka: [ '12345678' ],
      DneviZaZapadlost: [ '8' ],
  })
  console.log(xmlobj.toString())
})

*/


/*
{ Sifra: [ '' ],
  Naziv: [ '' ],
  Naslov: [ '' ],
  KraticaDrzave: [ '' ],
  PostnaStevilka: [ '' ],
  NazivPoste: [ '' ],
  DavcniZavezanec: [ '' ],
  DavcnaStevilka: [ '' ],
  IdentifikacijskaStevilka: [ '' ],
  DneviZaZapadlost: [ '' ],
  OdstotekRabata: [ '' ],
  SpletnaStran: [ '' ],
  Opomba: [ '' ] }
*/
