var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GlobalCustomerSchema = new Schema({

  _id: Schema.Types.ObjectId,
  name: String,
  vat: String,
  address: String,
  postal_num: String,
  city: String,
  country: String,
});

module.exports = mongoose.model('GlobalCustomer', GlobalCustomerSchema);
