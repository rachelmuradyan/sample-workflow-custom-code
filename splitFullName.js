const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {
  
    const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
  });
  
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["full_name"])
    .then(results => {
    
      let fullName = results.body.properties.full_name;
      let splitName = fullName.split(" ");
    
      callback({
        outputFields: {
          firstName: splitName[0],
          lastName: splitName[1]
        }
      });
    })
    .catch(err => {
      console.error(err);
    });
}
