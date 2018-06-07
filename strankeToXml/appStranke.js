const strankeJSON = require('./../data/strankeJSON')
      Stranka = require('./stranka')



Object.keys(strankeJSON).forEach((key)=>{
  //if(!strankeJSON[key].ID_DDV)console.log(strankeJSON[key].NAZIV)
  if(strankeJSON[key].ID_DDV.length === 8){
    var stranka = new Stranka()
    stranka.createObjectsFromMap(()=>{
      stranka.addStranka({
        Sifra: [ strankeJSON[key].ID_DDV ],
        Naziv: [ strankeJSON[key].NAZIV ],
        Naslov: [ strankeJSON[key].NASLOV ],
        KraticaDrzave: [ 'SI' ],
        PostnaStevilka: [ strankeJSON[key].POSTA ],
        NazivPoste: [ strankeJSON[key].KRAJ ],
        DavcniZavezanec: [ strankeJSON[key].ZAVEZANEC === 2 ? 'N':'D' ],
        DavcnaStevilka: [ strankeJSON[key].ID_DDV ],
        IdentifikacijskaStevilka: [ strankeJSON[key].ZAVEZANEC === 2 ? strankeJSON[key].ID_DDV:"SI"+strankeJSON[key].ID_DDV ],
      })
      console.log(stranka.toString())
    })

  }
})
