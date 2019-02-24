const express = require('express');
const docusign = require('docusign-esign');
const path = require('path');
const apiClient = new docusign.ApiClient();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const fs = require('fs');

const OAuthToken = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwAAhBe9UJrWSAgAAMQ6y5Oa1kgCAByAGSu2eMhHtW729xNu0DQVAAEAAAAYAAEAAAAFAAAADQAkAAAAZjBmMjdmMGUtODU3ZC00YTcxLWE0ZGEtMzJjZWNhZTNhOTc4MAAA0w6kUJrWSDcAsepvehliH0edUfK_phEckw.GNOtKapEPiQfYI-31yJ047h051gMZiyMYP0umZEN2ebt0pn0ra-AnJOl1CzgBC5hdDc-RjkWjgsQ43OJblQNqzbUHr3vOkME3_X56DIeM2zOQmarTwhewKJ52x1LV3c8ZH-l38eRfjsppXbHWac4PEBxEyhhrT_EB9pCtGCcnY70hsq4s-KKVHuitfJcc7j0aFXBWYkTjecb5_JPNvMamzNeLLwAyKRIzoghhRPqmUzL-Divor0U-j68kNQR9Xbw-IqxQjpS78ecjpFvrUtPN82S24AhZ0t04XVuB0lFlDsh9rcKNaDk0ziiksdut_1UAecETxwQUYA4D3IPOoqXdw';
const accountId = '7988863';

const recipientName = 'Manish Varma';
const recipientEmail = 'mvdmanish4@gmail.com';

const fileName = 'docs/House.pdf';

app.get('/', function (req, res) {

  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + OAuthToken);

  fileStream = process.argv[2];
  pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName));
  pdfBase64 = pdfBytes.toString('base64');

  docusign.Configuration.default.setDefaultApiClient(apiClient);

  let envDef = new docusign.EnvelopeDefinition();
  
  envDef.emailSubject = 'Document to be signed for Democratic Dinner Covention';
  envDef.emailBlurb = 'RSVP for the upcoming dinner invite with the President'

  let doc = new docusign.Document();
  doc.documentBase64 = pdfBase64;
  doc.fileExtension = 'pdf';
  doc.name = 'Invitation';
  doc.documentId = '1';
  
  let docs = [];
  docs.push(doc);
  envDef.documents = docs;
  
  let signer = new docusign.Signer();
  signer.name = recipientName;
  signer.email = recipientEmail;
  signer.routingOrder = '1';
  signer.recipientId = '1';
  signer.clientUserId = '123';
  
  let tabs = new docusign.Tabs();

  let signHere = new docusign.SignHere();
  signHere.documentId = '1';
  signHere.pageNumber = '1';
  signHere.recipientId = '1';
  signHere.tabLabel = 'SignHereTab';
  signHere.xPosition = '50';
  signHere.yPosition = '50';
  
  signHereTabArray = [];
  signHereTabArray.push(signHere);

  tabs.signHereTabs = signHereTabArray;
  
  signer.tabs = tabs;
  
  let signers = [];
  signers.push(signer);
  
  envDef.status = 'sent';
  
  let recipients = new docusign.Recipients();
  recipients.signers = signers;
  
  envDef.recipients = recipients;  
  
  let envelopesApi = new docusign.EnvelopesApi();
  envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef }, function (err, envelopeSummary, response) {

    if (err) {
      return res.send('Error while creating a DocuSign envelope:' + err);
    }
    
    let envelopeId = envelopeSummary.envelopeId;
    
    let recipientViewRequest = new docusign.RecipientViewRequest();
    recipientViewRequest.authenticationMethod = 'email';
    recipientViewRequest.clientUserId = '123';
    recipientViewRequest.recipientId = '1';
    recipientViewRequest.returnUrl = 'http://localhost:3000/dsreturn';
    recipientViewRequest.userName = recipientName;
    recipientViewRequest.email = recipientEmail;
    
    recipientViewResults = docusign.ViewLinkRequest();

    
    envelopesApi.createRecipientView(accountId, envelopeId, { recipientViewRequest: recipientViewRequest }, function (err, recipientViewResults, response) {

      if (err) {
        return res.send('Error while creating a DocuSign recipient view:' + err);
      }
      
      let signingUrl = recipientViewResults.url;
      
      res.redirect(signingUrl);
    });

  });

});

app.get('/dsreturn', function (req, res) {
  
  res.send('Welcome back, enter followup code / processing information here.');
});

app.listen(port, host, function (err) {
  if (err) {
    return res.send('Error while starting the server:' + err);
  }

  console.log('Your server is running on http://' + host + ':' + port + '.');
});
