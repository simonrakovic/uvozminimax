const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder({headless: true});


class IzdanRacun{
  constructor(){
    this.mapping = "/../mappings/izdanracun.xml"
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
    this.xmlobjmap.Temeljnica.GlavaTemeljnice.push(data)
  }

  addDDVTemeljnice(DDVGlava, DDVStopnja){
    this.xmlobjmap.Temeljnica.DDV[0].DDVVrstica[0].DDVGlava.push(DDVGlava)

    DDVStopnja.forEach((obj)=>{
      if(obj)this.xmlobjmap.Temeljnica.DDV[0].DDVVrstica[0].DDVStopnje[0].DDVStopnja.push(obj)
    })

  }

  addVrsticaTemeljnice(data){
    this.xmlobjmap.Temeljnica.VrsticeTemeljnice[0].VrsticaTemeljnice.push(data)
  }

  toString(){
    if(this.xmlobjmap.Temeljnica.DDV[0].DDVVrstica[0].DDVGlava) delete this.xmlobjmap.Temeljnica.DDV
    return builder.buildObject(this.xmlobjmap);
  }
}

/*
let xmlobj = new IzdanRacun()
ddvVisoka = 0
ddvZnizana = 20
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
  },[ddvVisoka !== 0 ? {
      SifraStopnjeDDV: [ 'S' ],
      Osnova: [ ddvVisoka/0.22 ],
      DDV: [ ddvVisoka ],
    }: null, ddvZnizana !== 0 ? {
      SifraStopnjeDDV: [ 'Z' ],
      Osnova: [ ddvZnizana/0.095 ],
      DDV: [ ddvZnizana ],
    }: null])

  console.log(xmlobj.toString())
})

*/
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


module.exports = IzdanRacun
