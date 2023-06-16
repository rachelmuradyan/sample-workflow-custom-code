// Import required libraries
const hubspot = require('@hubspot/api-client');
const mysql = require('mysql');

// This function is called when the custom coded action is executed
exports.main = (event, callback) => {

   
   const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
    });

    // Get the email address of the currently enrolled contact using the CRM Contacts API - can specifcy additional properties to pull
    hubspotClient.crm.contacts.basicApi.getById(event.object.objectId, ["email"])
        .then(results => {

            // Store the result in a variable - we'll use this in our SQL query
            let emailAddress = results.body.properties.email;

            // Create a mySQL connection - defining username, passowrd, host and DB using secrets
            var con = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DB
            });

            // 
            con.connect(function (err) {
                if (err) throw err;
                console.log("Connected!"); // Debugging - will show in 
                var sql = "SELECT * FROM  customers WHERE emailAddress = '" + emailAddress + "'"

                con.query(sql, function (err, result) {
                    if (err) throw err;
					
                  	// Check to see if any results returned
                    if (result.length > 0) { // RESULTS FOUND
                        console.log(result);
                           hubspotClient.crm.contacts.basicApi.update(event.object.objectId, {"properties":{"contact_found___mysql_db": true}});
                    } else { // NO RESULTS
                        console.log('no results found');
                        // set variable and pass to data output - if/then logic further in workflow... 
                        hubspotClient.crm.contacts.basicApi.update(event.object.objectId, {"properties":{"contact_found___mysql_db": false}});
                    }
                    con.end(); // Terminate connection
                });
            });
            callback({ outputFields: {} });
        })

        .catch(err => {
            console.error(err);
        });
}
