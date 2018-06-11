const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder({headless: true});


class PrejetRacun{
  constructor(){
    this.xmlObj = {

        GlavaTemeljnice:[],
        VrsticeTemeljnice:[]
      }


  }



  addGlavaTemeljnice(datum, opis){
    this.xmlObj.GlavaTemeljnice.push({
                          SifraVrsteTemeljnice: 'PR' ,
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




module.exports = PrejetRacun
