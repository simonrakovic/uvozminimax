const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder({headless: true});


class IzdanRacun{
  constructor(){
    this.xmlObj = {
        GlavaTemeljnice:[],
        VrsticeTemeljnice:[]
      }

  }

  addGlavaTemeljnice(datum, opis){
    this.xmlObj.GlavaTemeljnice.push({
                          SifraVrsteTemeljnice: 'IR' ,
                          DatumTemeljnice: datum ,
                          OpisGlaveTemeljnice: opis
                        })
  }

  addVrsticaTemeljnice(datum, datum_zapadlosti, datum_opravljanja, stranka, konto, breme, dobro, veza, id_knjizbe, opis){

    if(Number(stranka) !== 0 && Number(dobro) !== 0){
      this.xmlObj.VrsticeTemeljnice.push({
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
      this.xmlObj.VrsticeTemeljnice.push({
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
      this.xmlObj.VrsticeTemeljnice.push({
        DatumKnjizbe: datum,
        OpisVrsticeTemeljnice: opis ,
        SifraKonta: konto,
        ZnesekVDobroVDenarniEnoti: dobro,
        ZnesekVDobroVDomaciDenarniEnoti: dobro,
      })
    }else if(Number(stranka) === 0 && Number(breme) !== 0 ){

      this.xmlObj.VrsticeTemeljnice.push({
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
