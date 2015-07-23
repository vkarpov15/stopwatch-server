var loopback = require('loopback');
var boot = require('loopback-boot');
var PassportConfigurator =
  require('loopback-component-passport').PassportConfigurator;

var app = module.exports = loopback();

app.use(loopback.session({ secret: 'keyboard cat' }));

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

  // Create an instance of PassportConfigurator with the app instance
  var passportConfigurator = new PassportConfigurator(app);
  passportConfigurator.init();
  passportConfigurator.setupModels({
    userModel: app.models.User,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential
  });
  passportConfigurator.configureProvider('facebook-login',
    require('../providers.json')['facebook-login']);

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
