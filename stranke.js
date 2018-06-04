const fs = require('fs'),
      xml2js = require('xml2js');
      parser = new xml2js.Parser();
      builder = new xml2js.Builder();


class Stranke{

  constructor(){
    this.mapping = "/mappings/stranke.xml"
    this.xmlobjmap = null

    this.stranka = {}



  }

  createObjectsFromMap(cb){
    fs.readFile(__dirname + this.mapping, (err, data)=> {
        parser.parseString(data, (err, result)=> {

            this.stranka = result.Stranke.Stranka[0]
            result.Stranke.Stranka = []
            this.xmlobjmap = result
            cb(err)
        });
    });
  }

  addStranka(data){
    this.xmlobjmap.Stranke.Stranka.push(data)
  }


  toString(){

    return builder.buildObject(this.xmlobjmap);
  }
}


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
