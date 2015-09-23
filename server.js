/**
 * This example is intended to show a cookie usage in express setup and
 * also to be run as integration test for concurrency issues.
 *
 * Please remove setTimeout(), if you intend to use it as a blueprint!
 *
 */

// require modules
var express      = require('express'),
    i18n         = require('./i18n'),
    url          = require('url'),
    debug        = require('debug')('i18n:debug'),
    cookieParser = require('cookie-parser'),
    app          = module.exports = express();
    bodyParser   = require('body-parser');
    mongoose     = require('mongoose');
    mongoUri     = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/surveys';
    Survey       = require('./app/models/survey')
    port         = process.env.PORT || 3000;
    sendgrid     = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);


mongoose.connect(mongoUri); // connect to our database
// you'll need cookies
app.use(cookieParser());

// set a cookie
function detect_or_set_cookie(res){

    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('seen',randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  return res
};

// minimal config
i18n.configure({
  locales: ['en', 'ar', 'ar-sy', 'tr'],
  cookie: 'yourcookiename',
  directory: __dirname+'/locales'
});



// init i18n module for this loop
app.use(i18n.init);
app.use(bodyParser());

// set a cookie to requested locale
app.get('/', function (req, res) {
  console.log("Cookies: ", req.cookies)
  res.redirect('/ar');
});



// set a cookie to requested locale
app.get('/:locale', function (req, res) {

  if(!!req.cookies.seen){
    console.log('Return user ' + req.cookies.seen)
  }else{
    console.log('Setting cookie for new user')
    res = detect_or_set_cookie(res)
  }

  res.setLocale(req.params.locale)
  res.render('index.jade');
});


// set a cookie to requested locale
app.post('/:locale', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(req.cookies.seen)
  s = new Survey(
      {
          ip:                  ip,
          date:                new Date(),
          locale:              req.params.locale,
          twitter:             req.body.twitter,
          cookie:              req.cookies.seen,
          number_of_children:  parseInt(req.body.number_of_children)
      })
  s.save()

  sendgrid.send({
    to:       'mikefabrikant@gmail.com',
    from:     'wayfi@unicef.org',
    subject:  'new survey',
    text:     JSON.stringify(s)
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });

  res.render('finish.jade');
});




// startup
app.listen(port);
