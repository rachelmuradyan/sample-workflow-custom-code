const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {

    const hubspotClient = new hubspot.Client({
        accessToken: process.env.secretName
    });
    
    //First, make a call to get deal associations  
    hubspotClient.crm.deals.associationsApi.getAll(event.object.objectId, 'line_item').then((results) => {
      //Because a separate api call is needed for each associated line item, and each one returns a promise
      //where the promise is not dependent on any other call, each can be run using the Promise.all() method
      //The map() method takes 2 arguments - an initial array and a function to apply to every item in the initial array
      // then, returns an array of the results. in this case, it's an array of promises that each get line item details
        let lineItemPromises = results.body.results.map(item => {
            return hubspotClient.crm.lineItems.basicApi.getById(item.id, ['amount']).then(results => {
                return results.body
            })
        })
        
        //pass the array of promises into Promise.All, which then returns an array of all results, in this case the details
        // of every line item api call request.
        Promise.all(lineItemPromises).then(resultsArray => {
            console.log(resultsArray)
          //use the .filter() method to filter the array of results for just the high value line items 
            let highValueLineItems = resultsArray.filter(item => parseFloat(item.properties.amount) > 1000.00)
            console.log(`Length: ${li.length}`)
          //update the original deal with the newly calculated property value
            hubspotClient.crm.deals.basicApi.update(event.object.objectId, {
                'properties': {
                    'number_high_value_line_items': highValueLineItems.length.toString()
                }
            }).then(response => {
                console.log(response.body);
                callback({})
            })
        })
    }).catch((err) => {
        console.error(err)
    })

}
