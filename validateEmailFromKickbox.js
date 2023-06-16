//Import required libraries
const hubspot = require('@hubspot/api-client');
const request = require('request');

exports.main = (event, callback) => {
  //Create a new HubSpot Client
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
  });
  
  //  Get the email address of the currently enrolled contact
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["email"])
    .then(results => {
      let email = results.body.properties.email;

        // Form the GET request to the Kickbox API to verify email address
        var options = {
            "method": "GET",
            "url": "https://api.kickbox.com/v2/verify?email=" + email + "&apikey=" + process.env.KICKBOXAPI
        };

        request(options, function (error, response, body) {
          
          // Store the data in variables
          var acceptAll = JSON.parse(body).accept_all;
          var disposableAddress = JSON.parse(body).disposable;
          var freeAddress = JSON.parse(body).free;
          var roleAddress = JSON.parse(body).role;
          var reason = JSON.parse(body).reason;
          var result = JSON.parse(body).result;
          var sendexScore = JSON.parse(body).sendex;
          var didYouMean = JSON.parse(body).did_you_mean;

          // Update the contact properties with the above information
          hubspotClient.crm.contacts.basicApi.update(event.object.objectId, 
                { 
                	"properties": 
                	{ 
                      "kickbox_accept_all": acceptAll, 
                      "kickbox_disposable_address": disposableAddress, 
                      "kickbox_free_address": freeAddress, 
                      "kickbox_role_address": roleAddress, 
                      "kickbox_reason": reason, 
                      "kickbox_result": result, 
                      "kickbox_sendex_score": sendexScore, 
                      "kickbox_suggestions__did_you_mean_": didYouMean
                	}
                });
        });
    
        // Optional - Could pass information back as a data output to use as a data input with Copy to Property workflow action.
        callback({ outputFields: {} });
  });
}
