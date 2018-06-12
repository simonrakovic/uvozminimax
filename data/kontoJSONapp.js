const XLSX = require('xlsx');
      fs = require('fs')
      moment = require('moment')
      util = require('util')

var workbook = XLSX.readFile('kontniplan.xls');
var worksheet = workbook.Sheets.KontniPlan;
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

var kontniPlan = {}

data.forEach((obj)=>{
  kontniPlan[obj.Konto] = obj.NovKonto
})
console.log(kontniPlan)
