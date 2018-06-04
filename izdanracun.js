const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();


class IzdanRacun{
  constructor(){
    this.mapping = "/mappings/izdanracun.xml"
    this.xmlobjmap = null

    this.vrsticaTemeljnice = {}
    this.GlavaTemeljnice = {}
    this.DDVVrstica = {}
    this.DDVGlava = {}
    this.DDVStopnja  = {}


  }

  createObjectsFromMap(cb){
    fs.readFile(__dirname + this.mapping, (err, data)=> {
        parser.parseString(data, (err, result)=> {
            this.vrsticaTemeljnice = result.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice[0]
            result.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice = []

            this.GlavaTemeljnice = result.Temeljnica.GlavaTemeljnice[0]
            result.Temeljnica.GlavaTemeljnice = []


            this.DDVGlava = result.Temeljnica.DDV[0].DDVVrstica[0].DDVGlava[0]
            result.Temeljnica.DDV[0].DDVVrstica[0].DDVGlava = []

            this.DDVStopnja  = result.Temeljnica.DDV[0].DDVVrstica[0].DDVStopnje[0].DDVStopnja[0]
            result.Temeljnica.DDV[0].DDVVrstica[0].DDVStopnje[0].DDVStopnja = []

            this.xmlobjmap = result


            //this.vrsticaTemeljniceMap = result

            cb(err)
        });
    });
  }

  addGlavaTemeljnice(data){
    this.xmlobjmap.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice.push(data)
  }

  addDDVTemeljnice(DDVGlava, DDVStopnja){
    this.xmlobjmap.Temeljnica.DDV[0].DDVVrstica[0].DDVGlava.push(DDVGlava)
    this.xmlobjmap.Temeljnica.DDV[0].DDVVrstica[0].DDVStopnje[0].DDVStopnja.push(DDVStopnja)
  }

  addVrsticaTemeljnice(data){
    this.xmlobjmap.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice.push(data)
  }

  toString(){

    return builder.buildObject(this.xmlobjmap);
  }
}

let xmlobj = new IzdanRacun()
xmlobj.createObjectsFromMap((err)=>{

  xmlobj.addVrsticaTemeljnice({ DatumKnjizbe: [ '04-06-2018' ],
    OpisVrsticeTemeljnice: [ 'IR:2018-02' ],
    SifraKonta: [ '1200' ],
    SifraStranke: [ '12312321' ],
    DatumZapadlosti: [ '04-06-2018' ],
    DatumOpravljanja: [ '04-06-2018' ],
    VezaZaPlacilo: [ '2018-02' ],
    ZnesekVBremeVDenarniEnoti: [ '20.00' ],
    ZnesekVBremeVDomaciDenarniEnoti: [ '20.00' ]
  })

  xmlobj.addGlavaTemeljnice({
    SifraVrsteTemeljnice: [ 'IR' ],
    DatumTemeljnice: [ '2018-02' ],
    OpisGlaveTemeljnice: [ 'IR:2018-02' ]
  })


  xmlobj.addDDVTemeljnice({
     DatumDDV: [ '2013-02-02' ],
     KnjigaDDV: [ 'IR' ],
     DatumKnjizenjaDDV: [ '2013-02-02' ],
     SifraStranke: [ '123' ],
     Listina: [ 'IR:2013-12' ],
     DatumListine: [ '2011-02-01' ]
  },{
    SifraStopnjeDDV: [ 'S' ],
    Osnova: [ '100.00' ],
    DDV: [ '20.00' ],
    StoritevOsnova: [ '10.00' ],
    StoritevDDV: [ '2.00' ]
  })

  console.log(xmlobj.toString())
})


/*
{ DatumKnjizbe: [ '' ],
  OpisVrsticeTemeljnice: [ '' ],
  SifraKonta: [ '' ],
  SifraStranke: [ '' ],
  DatumZapadlosti: [ '' ],
  DatumOpravljanja: [ '' ],
  VezaZaPlacilo: [ '' ],
  ZnesekVBremeVDenarniEnoti: [ '' ],
  ZnesekVBremeVDomaciDenarniEnoti: [ '' ]
}

{
  SifraVrsteTemeljnice: [ 'IR' ],
  DatumTemeljnice: [ '2013-02-02' ],
  OpisGlaveTemeljnice: [ 'IR:2013-12' ]
}
{ DatumDDV: [ '2013-02-02' ],
  KnjigaDDV: [ 'IR' ],
  DatumKnjizenjaDDV: [ '2013-02-02' ],
  SifraStranke: [ '123' ],
  Listina: [ 'IR:2013-12' ],
  DatumListine: [ '2011-02-01' ] }
{ SifraStopnjeDDV: [ 'S' ],
  Osnova: [ '100.00' ],
  DDV: [ '20.00' ],
  StoritevOsnova: [ '10.00' ],
  StoritevDDV: [ '2.00' ] }

 */
