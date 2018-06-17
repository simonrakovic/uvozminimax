const fs = require('fs')
      XLSX = require('xlsx');

var logObj = {
  neuvozeniRacuni: [],
  otvoritve:[],
  uvozeniPrejetiRacuni:[],
  uvozeniIzdaniRacuni:[]
}

var getLogiraniIzdaniRacuni = (cb)=>{
  fs.readdir('.', (err, files) => {
    var counter = 0
    var end = counter > files.length-1
    files.forEach(file => {
      var fileName = file
      if(fileName.includes(".log")){
        var data = fs.readFileSync(fileName)
        data = JSON.parse(data)
        //console.log(data)
        logObj.neuvozeniRacuni.push(...data.neuvozeniRacuni)
        logObj.otvoritve.push(...data.otvoritve)
        logObj.uvozeniPrejetiRacuni.push(...data.uvozeniPrejetiRacuni)
        logObj.uvozeniIzdaniRacuni.push(...data.uvozeniIzdaniRacuni)
      }
      counter++
    });
    cb(logObj.uvozeniIzdaniRacuni)
  })
}

getLogiraniIzdaniRacuni((data)=>{
  console.log(data.toString())
})


module.exports = getLogiraniIzdaniRacuni

/*



var workbook = XLSX.readFile('../data/GK_KNJIZBA.xls');
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

var prejetiRacuniSaldo = []
var prejetiRacuniDokument = {}
var izpiski = {}
data.forEach((obj)=>{
  //console.log(obj)
  if(obj.SIMBOL === 9){
      if(obj.KONTO === "2200" || obj.KONTO === "2210" || obj.KONTO === "2211") prejetiRacuniSaldo[obj.ID_KNJIZBA] = obj
      if(prejetiRacuniDokument[obj.DOKUMENT]){
        prejetiRacuniDokument[obj.DOKUMENT].push(obj)
      }else{
        prejetiRacuniDokument[obj.DOKUMENT] = [obj]
      }
  }

  if(obj.SIMBOL === 11){

      izpiski[obj.ID_KNJIZBA] = obj

  }
})



getNeuvozeniRacuni((logs)=>{

  logs.forEach((log)=>{
    //console.log(izpiski[log.idKnjizbe].KONTO)
    if(izpiski[log.idKnjizbe].KONTO === "2200" || izpiski[log.idKnjizbe].KONTO === "2210" || izpiski[log.idKnjizbe].KONTO === "2211"){
      var breme = izpiski[log.idKnjizbe].DEBET
      var stranka = izpiski[log.idKnjizbe].PARTNER
      var iskanDokument = null
      prejetiRacuniSaldo.forEach((prejetRacun)=>{
        if(prejetRacun.KREDIT === breme && stranka === prejetRacun.PARTNER && !iskanDokument){
          iskanDokument = prejetiRacuniDokument[prejetRacun.DOKUMENT]
          console.log(log.idKnjizbe, prejetRacun.ID_KNJIZBA)
        }
      })
      if(!iskanDokument)console.log("ne najdem racuna za %s knjizbo!", log.idKnjizbe)
      //console.log(log)

    }else{
      console.log("Knjizba ni prejet račun!")
    }
  })
})
*/
