var https = require("https");
var fs = require("fs");

// https://github.com/magnetik/node-webid
var webid = require('./modules/webid');

var options  = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem'),
  requestCert:true
};

https.createServer(options, function(req, res) {
  res.writeHead(200);
  // req client certificate
  var certificate = req.connection.getPeerCertificate();
  // debug certificate
  console.log('Certificate', certificate);
  if (Object.keys(certificate).length > 0) {
    // If the user provite a certificate, verify it
    var verifAgent = new webid.VerificationAgent(certificate);
    verifAgent.verify(function (successLog) {
      // On success
      res.end("Login successful: \n" + JSON.stringify(successLog));
    }, function(errLog) {
      // On error
      switch (errLog) {
      case 'certificateProvidedSAN':
          var message = 'No valid Certificate Alternative Name in your certificate';
          break;
      case 'profileWellFormed':
          var message = 'Can\'t load your foaf file (RDF may not be valid)';
          break;
      case 'falseWebID':
          var message = 'Your certificate public key is not the one of the FOAF file';
          break;
      case 'profileAllKeysWellFormed':
          var message = "Missformed WebID";
          break;
      default:
          var message = "Unknown WebID error";
          break;
      }
      res.end("Error: " + message);
    });
  } else {
     res.end("Error: No client certificate"); 
  }
}).listen(8000);

// use window.crypto.logout() to logout (works in firefox but not in chrome)
