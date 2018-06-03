const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();


class IzdanRacun{
  constructor(){
    this.mapping = "/mappings/izdanracun.xml"
    this.data = null

    this.vrsticaTemeljnice = {}
    this.stevilkaRacuna = ""
    this.datumRacuna = ""
    this.datumValuteRacuna = ""
    this.datumOpravljanjaRacuna = ""
    this.sifraStranke = ""


    this.sifraTemeljnice = "IR"
    this.datumTemeljnice = this.datumRacuna
    this.nazivTemeljnice = this.sifraTemeljnice+": "+ this.stevilkaRacuna

  }

  createObjectsFromMap(cb){
    fs.readFile(__dirname + this.mapping, (err, data)=> {
        parser.parseString(data, (err, result)=> {
            this.data = result

            this.vrsticaTemeljnice = result.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice
            //this.vrsticaTemeljniceMap = result.
            console.log(this.vrsticaTemeljnice)
            cb(err)
        });
    });
  }


  addVrstica(data){

  }
}

let xmlobj = new IzdanRacun()
xmlobj.createObjectsFromMap((err)=>{
  console.log(xmlobj.data)
})
