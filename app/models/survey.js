// grab the things we need
var mongoose = require('mongoose');


// create a schema
var surveySchema = new mongoose.Schema(

  {
      twitter:            { type: String},
      xxx:                { type: String},
      router_id:          { type: String},
      ip:                 { type: String},
      locale:             { type: String},
      cookie:             { type: String}, 
      number_of_children: { type: Number},
      date:               { type: Date, default: Date.now }
  }, { collection : 'surveys' }
);

// the schema is useless so far
// we need to create a model using it
var Survey = mongoose.model('Survey', surveySchema);

// make this available to our users in our Node applications
module.exports = Survey;
