const express = require('express');
const docusign = require('docusign-esign');
const apiClient = new docusign.ApiClient();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const OAuthToken = '';
const accountId = '';


const templateRoleName = ''; 
const recipientName = '';
const recipientEmail = '';
const templateId = '';

app.get('/', function (req, res) {


  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + OAuthToken);  
  

  docusign.Configuration.default.setDefaultApiClient(apiClient);

  let envDef = new docusign.EnvelopeDefinition();
  
  envDef.emailSubject = 'Document to be signed for Democratic Dinner Covention';
  envDef.emailBlurb = 'RSVP for the upcoming dinner invite with the President'

  envDef.templateId = templateId;

  let signer1TemplateRole = new docusign.TemplateRole();
  signer1TemplateRole.roleName = templateRoleName;
  signer1TemplateRole.email = recipientEmail;
  signer1TemplateRole.name = recipientName;

  let templateRoleArray = [];
  templateRoleArray.push(signer1TemplateRole);

  let templateRecipients = new docusign.TemplateRecipients;
  templateRecipients = templateRoleArray;

  envDef.templateRoles = templateRecipients;
  
  envDef.status = 'sent';
    
  let envelopesApi = new docusign.EnvelopesApi();
  envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef }, function (err, envelopeSummary, response) {

    if (err) {
      return res.send('Error while creating a DocuSign envelope:' + err);
    }

    res.send(envelopeSummary);

  });
});

app.listen(port, host, function (err) {
  if (err) {
    return res.send('Error while starting the server:' + err);
  }

  console.log('Your server is running on http://' + host + ':' + port + '.');
});