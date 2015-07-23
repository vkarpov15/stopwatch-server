var loopback = require('loopback');
var boot = require('loopback-boot');
var PassportConfigurator =
  require('loopback-component-passport').PassportConfigurator;

var app = module.exports = loopback();

// Create an instance of PassportConfigurator with the app instance
var passportConfigurator = new PassportConfigurator(app);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  app.middleware('session:before', loopback.cookieParser('test secret'));
  app.middleware('session', loopback.session({
    secret: 'other test secret',
    saveUninitialized: true,
    resave: true
  }));
  app.middleware('auth', loopback.token({
    model: app.models.accessToken,
    currentUserLiteral: 'me'
  }));

  passportConfigurator.init();
  passportConfigurator.setupModels({
    userModel: app.models.User,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential
  });
  passportConfigurator.configureProvider('facebook-login',
    require('../providers.json')['facebook-login']);

  app.get('/auth/token', function(req, res) {
    res.json({ token: req.accessToken && req.accessToken.id });
  });

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
