const hubspot = require('@hubspot/api-client');

exports.main = (event, callback) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
  });
  
  hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["selected_date"])
    .then(results => {
     
     // depending on the date format you have setup you may need to adjust this. This assumes format DD/MM/YYYY
    let selectedDate = results.body.properties.selected_date.split(" ");
      let dayNow = selectedDate[0];
      let monthNow = selectedDate[2];
      let daySuffix = "";
      
      switch (dayNow) {
        case "1":
        case "21":
        case "31":
            daySuffix = "st";
            break;
        case "2":
        case "22":
            daySuffix = "nd";
            break;
        case "3":
        case "23":
            daySuffix = "rd";
            break;
        default:
            daySuffix = "th";
            break;
	}
    
    let updatedDate = dayNow + daySuffix + " of " + monthNow;
        
      callback({
        outputFields: {
	      updatedDate: updatedDate
        }
      });
    })
    .catch(err => {
      console.error(err);
    });
}
