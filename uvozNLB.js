const BancniIzpisek = require('./bancniIzpiskiToXml/bancniIzpisek')
      PrejetRacun = require('./prejetiRacuniToXml/prejetRacun')
      IzdanRacun = require('./izdaniRacuniToXml/izdanracun')
      Zapiranje = require('./zapiranje')
      Uvoz = require('./uvoz')
      XLSX = require('xlsx');
      moment = require('moment')
      stranke = require('./data/strankeJSON')
      kontniPlan = require('./data/kontniPlanJSON')


function uvozNLB(st_izpiska_od, st_izpiska_do){
  var workbook = XLSX.readFile('data/Knjizbe.xls');
  var worksheet = workbook.Sheets.GK;
  var headers = {};
  var data = [];

  for(z in worksheet) {
     if(z[0] === '!') continue;
     //parse out the column, row, and value
     var col = z.substring(0,1);
     var row = parseInt(z.substring(1));
     var value = worksheet[z].v;

     //store header names
     if(row == 1) {
         headers[col] = value;
         continue;
     }

     if(!data[row]) data[row]={};

     data[row][headers[col]] = value;

  }
  //drop those first two rows which are empty
  data.shift();
  data.shift();




  let prejetiRacuni = {}
  let izdaniRacuni = {}
  let bancniIzpiskiAdiko = {}
  let otvoritve = { }

  data.forEach((obj)=>{

    if(obj.SIMBOL === 9){
      if(prejetiRacuni[obj.VEZA])prejetiRacuni[obj.VEZA].push(obj)
      else prejetiRacuni[obj.VEZA] = [obj]

    }else if(obj.SIMBOL === 8 ){
      if(bancniIzpiskiAdiko[obj.DOKUMENT])bancniIzpiskiAdiko[obj.DOKUMENT].push(obj)
      else bancniIzpiskiAdiko[obj.DOKUMENT] = [obj]

    }else if(obj.SIMBOL === 2){
      if(izdaniRacuni[obj.DOKUMENT])izdaniRacuni[obj.DOKUMENT].push(obj)
      else izdaniRacuni[obj.DOKUMENT] = [obj]

    }else if(obj.SIMBOL === 7){
      if(otvoritve[obj.DOKUMENT])otvoritve[obj.DOKUMENT].push(obj)
      else otvoritve[obj.DOKUMENT] = [obj]

    }
  })



  var st_od = st_izpiska_od
  var st_do = st_izpiska_do
  var izpisXML = ""
  var uvoz = new Uvoz()
  var xmlname = "Bancni_izpiski"

  for(let i = st_od; i < st_do + 1; i++){
    //// key je string zato +""

    var izpisekData = bancniIzpiskiAdiko[i+""]
    var stIzpiska = ""
    var datumIzpiska = ""
    var opisKnjizbe = ""
    var bancniIzpisek = new BancniIzpisek()

    izpisekData.forEach((postavka)=>{
      stIzpiska = postavka.DOKUMENT
      datumIzpiska = postavka.DATUM_DOKUMENTA
      opisKnjizbe = postavka.OPIS_DOKUMENTA

      if(postavka.KONTO === '1200'){

        if(!uvoz.uvozeniIzdaniRacuniByVeza[postavka.VEZA])ustvariIzdanracun(uvoz, izdaniRacuni, otvoritve, postavka.VEZA, Math.abs(parseFloat(postavka.KREDIT).toFixed(2)), postavka.ID_KNJIZBA, postavka.PARTNER)
        else{
          console.log("hi")
          var zapiranje = new Zapiranje(uvoz.uvozeniIzdaniRacuniByVeza[postavka.VEZA], postavka.ID_KNJIZBA, Math.abs(parseFloat(postavka.KREDIT).toFixed(2)))
          uvoz.addZapiranje(zapiranje.xmlObj)
        }
      }else if(postavka.KONTO === '2211' || postavka.KONTO === '2210' ){
        //ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBA, postavka.PARTNER)

      }else if(postavka.KONTO === '2200' && postavka.VEZA !== 'PROVIZIJA'){
        //ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBA, postavka.PARTNER)

      }else if(postavka.KONTO === '2200' && postavka.VEZA === 'PROVIZIJA'){


      }else if(postavka.KONTO === '1100'){

      }

      if(otvoritve[postavka.VEZA])opisKnjizbe = "OTV2017-"+opisKnjizbe
      bancniIzpisek.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, opisKnjizbe)
    })
    //xmlname += "_"+stIzpiska
    bancniIzpisek.addGlavaTemeljnice(foramtDate(datumIzpiska), "NLB izpisek "+ stIzpiska)
    //logTemeljnica(bancniIzpisek)
    uvoz.addTemeljnica(bancniIzpisek.xmlObj)
  }

  uvoz.createXml(xmlname)
}

//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function ustvariIzdanracun(uvoz, izdaniRacuni, otvoritve, veza, znesek_zapiranja, id_knjizbe_na_izpisku, stranka){
  var izdanRacun = new IzdanRacun()
  var izdanRacunXML = ""
  var idKnjizbe = ""


  if(izdaniRacuni[veza] ){
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    izdaniRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBA
        znesekKnjizbe = parseFloat(postavka.DEBET).toFixed(2)

        uvoz.addUvozeniIzdaniRacuniByVeza(postavka)
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(izdanRacun.xmlObj)

    var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesek_zapiranja)
    uvoz.addZapiranje(zapiranje.xmlObj)

    //logiranje uvozenih izdanih racunovs

    uvoz.addUvozenIzdanRacun(veza)

    return izdanRacunXML
  }else if(otvoritve[veza]){

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    //logiranje otvoritev
    uvoz.addOtvoritev(veza)
    return null
  }else{
    // logiranje neUvozenihRacunov
    uvoz.addNeUvozeniRacuni({veza: veza, idKnjizbe: id_knjizbe_na_izpisku})
    //console.log(veza)
    return null
  }

}

function ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, veza, id_knjizbe_na_izpisku, stranka){
  var prejetRacun = new PrejetRacun()
  var idKnjizbe = ""
  var znesekKnjizbe = ""
  var prejetRacunXML = ""

  if(prejetiRacuni[veza] ){
    var datumTemeljnice = ""
    var opisTemeljnice = ""
    var partner = ""
    prejetiRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '2200' || postavka.KONTO === '2211' || postavka.KONTO === '2210'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBA
        znesekKnjizbe = parseFloat(postavka.KREDIT).toFixed(2)
        partner = postavka.PARTNER
      }

      prejetRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA, stranke[postavka.PARTNER] && stranke[postavka.PARTNER].ID_DDV, kontniPlan[postavka.KONTO], parseFloat(postavka.DEBET).toFixed(2), parseFloat(postavka.KREDIT).toFixed(2),postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    //console.log(stranka, partner)
    if(partner === stranka){
      prejetRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
      uvoz.addTemeljnica(prejetRacun.xmlObj)

      var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesekKnjizbe)
      uvoz.addZapiranje(zapiranje.xmlObj)

      //logiranje uvozenih prjetih racunovs
      uvoz.addUvozenPrejetRacun(veza)

      return prejetRacunXML
    }else{
      uvoz.addNeUvozeniRacuni({veza: veza, idKnjizbe: id_knjizbe_na_izpisku})
    }


  }else if(otvoritve[veza]){


    //logTemeljnica(izdanRacun)
    //logiranje otvoritev
    uvoz.addOtvoritev(veza)
    return null
  }else{
    // logiranje neUvozenihRacunov
    var jeOtvoritev = false
    Object.keys(otvoritve).forEach((key)=>{
      otvoritve[key].forEach((otv)=>{
        if(otv.VEZA === veza){
          jeOtvoritev = true
          return
        }
      })
      if(jeOtvoritev)return
    })
    if(jeOtvoritev)uvoz.addOtvoritev(veza)
    else uvoz.addNeUvozeniRacuni({veza: veza, idKnjizbe: id_knjizbe_na_izpisku})
    //console.log(veza)
    return null
  }

}


function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('YYYY-MM-DD')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}


module.exports = uvozNLB
