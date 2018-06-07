const fs = require('fs'),
      xml2js = require('xml2js');
      parser = new xml2js.Parser();
      builder = new xml2js.Builder({headless: true});
      XLSX = require('xlsx');
      stranke = require('./../data/strankeJSON')

class Stranka{

  constructor(){
    this.mapping = "/../mappings/stranka.xml"
    this.xmlobjmap = null

    this.stranka = {}



  }

  createObjectsFromMap(cb){
    fs.readFile(__dirname + this.mapping, (err, data)=> {
        parser.parseString(data, (err, result)=> {
            
            this.stranka = result.Stranka
            result.Stranka = null
            this.xmlobjmap = result
            cb(err)
        });
    });
  }

  addStranka(data){
    this.xmlobjmap.Stranka = data
  }


  toString(){

    return builder.buildObject(this.xmlobjmap);
  }
}

//console.log(stranke)


module.exports = Stranka


/*
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
console.log(JSON.stringify(stranke))


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
