const xml2js = require('xml2js');
const builder = new xml2js.Builder({headless: true});
const fs = require('fs')

class Uvoz{
  constructor(){
    this.otvoritve = []
    this.neuvozeniRacuni = []
    this.uvozeniIzdaniRacuni = []
    this.uvozeniPrejetiRacuni = []
    this.objData = {
       miniMAXUvozKnjigovodstvo:{
          '$':{ xmlns: 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo',
              'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
              'xsi:schemaLocation': 'http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo http://moj.minimax.si/ip/doc/schemas/miniMAXUvozKnjigovodstvo.xsd' },
           Temeljnice: [
             {
               Temeljnica:[]
             }
           ],
           Zapiranja: [{
             Zapiranje:[]
           }]
         }
      }
  }

  addOtvoritev(otvoritev){
    this.otvoritve.push(otvoritev)
  }

  addNeUvozeniRacuni(racun){
    this.neuvozeniRacuni.push(racun)
  }

  addUvozenIzdanRacun(izdanRacun){
    this.uvozeniIzdaniRacuni.push(izdanRacun)
  }

  addUvozenPrejetRacun(prejetRacun){
    this.uvozeniPrejetiRacuni.push(prejetRacun)
  }

  addTemeljnica(temeljnica){
    //console.log(this.objData)
    this.objData.miniMAXUvozKnjigovodstvo.Temeljnice[0].Temeljnica.push(temeljnica)
  }

  addZapiranje(zapiranje){
    this.objData.miniMAXUvozKnjigovodstvo.Zapiranja[0].Zapiranje.push(zapiranje)
  }

  toString(){
    return builder.buildObject(this.objData);
  }


  createLog(filename){
    var path = __dirname + "/Uvozi/"+Date.now()+"_"+filename+".log"
    var obj = {
      neuvozeniRacuni: this.neuvozeniRacuni,
      uvozeniIzdaniRacuni: this.uvozeniIzdaniRacuni,
      uvozeniPrejetiRacuni: this.uvozeniPrejetiRacuni,
      otvoritve: this.otvoritve,
    }
    console.log(obj)
    fs.writeFile(path, JSON.stringify(obj), (err)=>{
      if(err)console.log(err)
    })
  }

  createXml(filename){
    var path = __dirname + "/Uvozi/"+Date.now()+"_"+filename+".xml"
    fs.writeFile(path, builder.buildObject(this.objData), (err)=>{
      if(err)console.log(err)
      else this.createLog(filename)
    })
  }
}


module.exports = Uvoz
