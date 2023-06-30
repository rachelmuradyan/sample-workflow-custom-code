const hubspot = require('@hubspot/api-client');
const axios = require('axios')

exports.main = (event, callback) => {
  // secrets can be accessed via environment variables
  // make sure to add your Private App under "Secrets management" above
  const hubspotClient = new hubspot.Client({
  accessToken: process.env.secretName
  });
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["recent_salesforce_campaign",'email','salesforceleadid','salesforcecontactid'])
    .then(results => {
      let recent_salesforce_campaign = results.body.properties.recent_salesforce_campaign;
    let email = results.body.properties.email;
    let salesforceleadid = results.body.properties.salesforceleadid
    let data = {recent_salesforce_campaign:recent_salesforce_campaign,email:email,salesforceleadid:salesforceleadid}
    console.log(data)
      return data

    }).then(data => {
    //Create a webhook listener in an iPaaS service such as Integromat and customize the POST request URL
    axios.post('https://SOME_WEBHOOK_URL', {
    recent_salesforce_campaign: recent_salesforce_campaign,
    email: data.email,
      salesforceleadid: data.salesforceleadid
  })
  .then(function (response) {
    console.log(response.body);
  })
  .catch(function (error) {
    console.log(error);
  });
  })
    .catch(err => {
      console.error(err);
    });
}
