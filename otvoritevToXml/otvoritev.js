const fs = require('fs'),
    xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder({headless: true});


class Otvoritev{
  constructor(){
    this.boilerPlate = {
       miniMAXUvozKnjigovodstvo:{
          '$':{ xmlns: 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo',
              'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
              'xsi:schemaLocation': 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo.xsd' },
           Temeljnice: [
             {
               Temeljnica:[]
             }
           ]
         }
      }

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
                          SifraVrsteTemeljnice: 'OTV' ,
                          DatumTemeljnice: datum ,
                          OpisGlaveTemeljnice: opis
                        })
  }


  addVrsticaTemeljnice(datum, datum_zapadlosti, datum_opravljanja, stranka, konto, breme, dobro, veza, id_knjizbe, opis){
    if(!Number(stranka) && stranka ){
      stranka = Number(stranka.replace(/\D/g,''))+""
      if(stranka.lenghth === 8)stranka += "0"
    }

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
    var output = this.boilerPlate
    output.miniMAXUvozKnjigovodstvo.Temeljnice[0].Temeljnica.push(this.xmlObj)
    return builder.buildObject(output);
  }
}




module.exports = Otvoritev
