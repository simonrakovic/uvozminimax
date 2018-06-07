const BancniIzpisek = require('./bancniIzpiskiToXml/bancniIzpisek')
      PrejetRacun = require('./prejetiRacuniToXml/prejetRacun')
      IzdanRacun = require('./izdaniRacuniToXml/izdanracun')
      Zapiranje = require('./zapiranje')
      XLSX = require('xlsx');
      moment = require('moment')
      stranke = require('./data/strankeJSON')

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



var st_od = 1
var st_do = 1
var izpisXML = ""

for(let i = st_od; i < st_do + 1; i++){
  //// key je string zato +""
  var izpisekData = bancniIzpiskiAdiko[i+""]
  var bancniIzpisek = new BancniIzpisek()

  izpisekData.forEach((postavka)=>{
    bancniIzpisek.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

    if(postavka.KONTO === '1200'){
      izpisXML += ustvariIzdanracun(izdaniRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBE)

    }else if(postavka.KONTO === '2211' || postavka.KONTO === '2210' ){
      izpisXML += ustvariPrejetRacun(prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBE)

    }else if(postavka.KONTO === '2200' && postavka.VEZA !== 'PROVIZIJA'){
      izpisXML += ustvariPrejetRacun(prejetiRacuni, otvoritve, postavka.VEZA, postavka.ID_KNJIZBE)

    }else if(postavka.KONTO === '2200' && postavka.VEZA === 'PROVIZIJA'){


    }else if(postavka.KONTO === '1100'){

    }else{
      console.log(postavka)
    }
  })
  //logTemeljnica(bancniIzpisek)
  console.log(bancniIzpisek.toString()+izpisXML)
}

//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function ustvariIzdanracun(izdaniRacuni, otvoritve, veza, id_knjizbe_na_izpisku){
  var izdanRacun = new IzdanRacun()
  var izdanRacunXML = ""

  if(izdaniRacuni[veza]){
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    izdaniRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)

    izdanRacunXML += izdanRacun.toString()

    //logTemeljnica(izdanRacun)
    return izdanRacunXML
  }else if(otvoritve[veza]){

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    otvoritve[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)

    izdanRacunXML += izdanRacun.toString()

    //logTemeljnica(izdanRacun)
    //logOtvoirtev(otvoritve[veza])
    return izdanRacunXML
  }else{
    //logNezaprtiIzdaniRacuni(veza, id_knjizbe_na_izpisku)
    return null
  }

}

function ustvariPrejetRacun(prejetiRacuni, veza, id_knjizbe_na_izpisku){
  var prejetRacun = new PrejetRacun()
  var Zapiranje = new Zapiranje()
  if(prejetiRacuni[veza]){
    var datumTemeljnice = ""
    var opisTemeljnice = ""

    prejetiRacuni[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
      }
      prejetRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

    })

    prejetRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)
    izdanRacunXML += izdanRacun.toString()
    //logTemeljnica(prejetRacun)
    return izdanRacunXML

  }else if(otvoritve[veza]){

    var datumTemeljnice = ""
    var opisTemeljnice = ""

    otvoritve[veza].forEach((postavka)=>{
      if(postavka.KONTO === '1200'){
        datumTemeljnice = foramtDate(postavka.DATUM_DOKUMENTA)
        opisTemeljnice = "IR: "+ postavka.DOKUMENT
      }
      izdanRacun.addVrsticaTemeljnice(foramtDate(postavka.DATUM_DOKUMENTA), postavka.ROK_PLACILA ? foramtDate(postavka.ROK_PLACILA): foramtDate(postavka.DATUM_DOKUMENTA), postavka.DATUM_DOKUMENTA,postavka.PARTNER, postavka.KONTO, postavka.DEBET, postavka.KREDIT,postavka.VEZA, postavka.ID_KNJIZBE, postavka.OPIS_DOKUMENTA)

    })

    izdanRacun.addGlavaTemeljnice(datumTemeljnice, opisTemeljnice)

    izdanRacunXML += izdanRacun.toString()

    //logTemeljnica(izdanRacun)
    //logOtvoirtev(otvoritve[veza])
    return izdanRacunXML
  }else{
    //logNezaprtiPrejetiRacuni(veza, id_knjizbe_na_izpisku)
    return null
  }

}


function foramtDate(date){
  return moment(ExcelDateToJSDate(date)).format('DD-MM-YYYY')
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}
