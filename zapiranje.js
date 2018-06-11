const xml2js = require('xml2js');
const builder = new xml2js.Builder({headless: true});


class Zapiranje{
  constructor(StevilkaZapiraneKnjizbe, StevilkaZapirajoceKnjizbe, ZnesekVDomaciDenarniEnoti){
    this.xmlObj = {
          StevilkaZapiraneKnjizbe: StevilkaZapiraneKnjizbe,
          StevilkaZapirajoceKnjizbe: StevilkaZapirajoceKnjizbe,
          ZnesekVDomaciDenarniEnoti: ZnesekVDomaciDenarniEnoti
        }
    
  }


  toString(){
    return builder.buildObject(this.xmlObj);
  }
}

module.exports = Zapiranje
