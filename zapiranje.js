
class Zapiranje(){
  constructor(){
    this.xmlObj = {
      Zapiranje:[]
    }
  }

  addZapiranje(StevilkaZapiraneKnjizbe, StevilkaZapirajoceKnjizbe, ZnesekVDomaciDenarniEnoti){
    xmlObj.Zapiranje.push({
      StevilkaZapiraneKnjizbe: StevilkaZapiraneKnjizbe,
      StevilkaZapirajoceKnjizbe: StevilkaZapirajoceKnjizbe,
      ZnesekVDomaciDenarniEnoti: ZnesekVDomaciDenarniEnoti
    })
  }


  toString(){
    return builder.buildObject(this.xmlObj);
  }
}

module.exports = Zapiranje
