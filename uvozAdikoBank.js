const BancniIzpisek = require('./bancniIzpiskiToXml/bancniIzpisek')
      PrejetRacun = require('./prejetiRacuniToXml/prejetRacun')
      IzdanRacun = require('./izdaniRacuniToXml/izdanracun')
      Zapiranje = require('./zapiranje')
      Uvoz = require('./uvoz')
      XLSX = require('xlsx');
      moment = require('moment')
      stranke = require('./data/strankeJSON')



function uvozAdikoBank(st_izpiska_od, st_izpiska_do){
  var workbook = XLSX.readFile('data/GK_KNJIZBA.xls');
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

    }else if(obj.SIMBOL === 11 ){
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

    var bancniIzpisek = new BancniIzpisek()

    izpisekData.forEach((postavka)=>{
      stIzpiska = postavka.DOKUMENT
      datumIzpiska = postavka.DATUM_DOKUMENTA
      bancniIzpisek.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

      if(postavka.KONTO === '1200'){
        ustvariIzdanracun(uvoz, izdaniRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBA)

      }else if(postavka.KONTO === '2211' || postavka.KONTO === '2210' ){
        ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBA)

      }else if(postavka.KONTO === '2200' && postavka.VEZA !== 'PROVIZIJA'){
        ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBA)

      }else if(postavka.KONTO === '2200' && postavka.VEZA === 'PROVIZIJA'){


      }else if(postavka.KONTO === '1100'){

      }else{
        console.log("Nedefinirana postavka v izpisku "+postavka)
      }
    })
    xmlname += "_"+stIzpiska
    bancniIzpisek.addGlavaTemeljnice(foramtDate(datumIzpiska), "ADIKO BANK izpisek "+ stIzpiska)
    //logTemeljnica(bancniIzpisek)
    uvoz.addTemeljnica(bancniIzpisek.xmlObj)
  }

  uvoz.createXml(xmlname)
}

//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function ustvariIzdanracun(uvoz, izdaniRacuni, otvoritve, veza, id_knjizbe_na_izpisku){
  var izdanRacun = new IzdanRacun()
  var izdanRacunXML = ""
  var idKnjizbe = ""
  var znesekKnjizbe = ""

  if(izdaniRacuni[veza]){
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    izdaniRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBE
        znesekKnjizbe = postavka.DEBET
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(izdanRacun.xmlObj)

    var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesekKnjizbe)
    uvoz.addZapiranje(zapiranje.xmlObj)

    //logiranje uvozenih izdanih racunovs
    uvoz.addUvozenIzdanRacun(veza)

    return izdanRacunXML
  }else if(otvoritve[veza]){

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    otvoritve[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBA
        znesekKnjizbe = postavka.DEBET
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(izdanRacun.xmlObj)

    //console.log(idKnjizbe+"|"+id_knjizbe_na_izpisku+"|"+znesekKnjizbe)
    var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesekKnjizbe)
    uvoz.addZapiranje(zapiranje.xmlObj)


    //logiranje otvoritev
    uvoz.addOtvoritev(veza)
    return izdanRacunXML
  }else{
    // logiranje neUvozenihRacunov
    uvoz.addNeUvozeniRacuni(veza)
    //console.log(veza)
    return null
  }

}

function ustvariPrejetRacun(uvoz, prejetiRacuni, otvoritve, veza, id_knjizbe_na_izpisku){
  var prejetRacun = new PrejetRacun()
  var idKnjizbe = ""
  var znesekKnjizbe = ""
  var prejetRacunXML = ""

  if(prejetiRacuni[veza]){
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    prejetiRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '2200' || postavka.KONTO === '2211' || postavka.KONTO === '2210'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBE
        znesekKnjizbe = postavka.KREDIT
      }
      prejetRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    prejetRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(prejetRacun.xmlObj)

    var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesekKnjizbe)
    uvoz.addZapiranje(zapiranje.xmlObj)


    //logiranje uvozenih prjetih racunovs
    uvoz.addUvozenPrejetRacun(veza)

    return prejetRacunXML

  }else if(otvoritve[veza]){

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    otvoritve[veza].forEach((postavka)=>{
      if(postavka.KONTO === '2200' || postavka.KONTO === '2211' || postavka.KONTO === '2210'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
        idKnjizbe = postavka.ID_KNJIZBE
        znesekKnjizbe = postavka.KREDIT



      }
      prejetRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBA, postavka.OPIS_DOKUMENTA)

    })

    prejetRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    uvoz.addTemeljnica(prejetRacun.xmlObj)

    var zapiranje = new Zapiranje(idKnjizbe, id_knjizbe_na_izpisku, znesekKnjizbe)
    uvoz.addZapiranje(zapiranje.xmlObj)

    //logTemeljnica(izdanRacun)
    //logiranje otvoritev
    uvoz.addOtvoritev(veza)
    return prejetRacun
  }else{
    // logiranje neUvozenihRacunov
    uvoz.addNeUvozeniRacuni(veza)
    //console.log(veza)
    return null
  }

}


function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('DD-MM-YYYY')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}


module.exports = uvozAdikoBank
