// Import the Hubspot NodeJS Client Library - this will allow us to use the HubSpot APIs
const hubspot = require('@hubspot/api-client');

/* 
This function is called when the custom code action is executed. It takes 2 arguements. The first is the event object which contains information on the currently enrolled object. 
The second is the callback function which is used to pass data back to the workflow.
*/
exports.main = (event, callback) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
  });
  
  // Retrive the currently enrolled contacts "company" property
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["company"])
    .then(results => {
	// Get data from the results and store in variables
	let companyName = results.body.properties.company;
        //console.log("SEARCH TERM: " + companyName); // - FOR DEBUG

	// Create search criteria   
	const filter = { propertyName: 'name', operator: 'EQ', value: companyName }
	const filterGroup = { filters:	[filter] 	}
        const sort = JSON.stringify({ propertyName: 'name', direction: 'DESCENDING'})
        const properties = ['name']
        const limit = 1
        const after = 0
        
        const searchCriteria = {
          filterGroups: [filterGroup],
          sorts: [sort],
          properties,
          limit,
          after
        }
    
      // Search the CRM for Companies matching "companyName" variable defined earlier
      hubspotClient.crm.companies.searchApi.doSearch(searchCriteria).then(searchCompanyResponse => {
        
         //console.log("RESULTS: " + searchCompanyResponse.body.total); // - FOR DEBUG
 
         // If total equals 0 no results found
         if(searchCompanyResponse.body.total == 0){ //NO MATCH FOUND - CREATE COMPANY AND ASSOCIATE
           // console.log("COMPANY " + companyName  + "NOT FOUND: CREATE + ASSOCIATE") // - FOR DEBUG
           
           //Create a Company object
            const companyObj = {
                properties: {
                    name: companyName,
                },
            }
           
           //Create the Company using Company object above
           hubspotClient.crm.companies.basicApi.create(companyObj).then(companyCreateResponse =>{
             //Associate Company with Contact using the ID returned from the previous request
             hubspotClient.crm.companies.associationsApi.create(companyCreateResponse.body.id,'contacts', event.object.objectId,'company_to_contact');
           });
           
         }else{ // MATCH FOUND - ASSOCIATE COMPANY TO CONTACT
           // console.log("COMPANY " + companyName + " FOUND: ASSOCIATE RECORDS"); // - FOR DEBUG
          //Associate Company with Contact
           hubspotClient.crm.companies.associationsApi.create(searchCompanyResponse.body.results[0].id,'contacts', event.object.objectId,'company_to_contact');
         }
      });
   
      callback({outputFields: {}});
    
    })
    .catch(err => {
      console.error(err);
    });
}
