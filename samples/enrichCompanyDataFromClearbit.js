// Import required libraries
const hubspot = require('@hubspot/api-client');
const request = require('request');

exports.main = (event, callback) => {
  
    // Create a new HubSpot API client
    const hubspotClient = new hubspot.Client({
    accessToken: process.env.secretName
    });

    // Use the API client to get the domain of the object (company) currently enrolled in the workflow
    hubspotClient.crm.companies.basicApi.getById(event.object.objectId, ["domain"]).then(results => {

        let companyDomain = results.body.properties.domain; //Store company domain in variable to use in later request to ClearBit API

        //Make a request to ClearBit API to retrieve company information based on the domain of enrolled company.
        var options = {
            "method": "GET",
            "url": "https://company.clearbit.com/v2/companies/find?domain=" + companyDomain,
            "headers": {
                "Authorization": "Bearer " + process.env.CLEARBITAPI
            }
        };
        
        request(options, function (error, response, body) {

            /* 
              Information returned from Clearbit can be stored in variables - I've included in comments the internal name of 
              the properties in HubSpot as I will use the CRM API to update in bulk towards end of the custom coded action.
            */
          
            //GENERAL INFORMATION
            var companyName = JSON.parse(body).name //company_name
            var legalName = JSON.parse(body).legalName; //legal_name
            var phoneNumber = JSON.parse(body).phone; //phone_number 
            var companyType = JSON.parse(body).type //type_of_company
            var ticker = JSON.parse(body).ticker //ticker
            var foundedYear = JSON.parse(body).foundedYear //founded_year
            var description = JSON.parse(body).description //description
            var parentDomain = JSON.parse(body).parent.domain; //parent_domain
            var ultimateParent = JSON.parse(body).ultimateParent.domain; //ultimate_parent_domain
            var domainAliases = JSON.parse(body).domainAliases.join(","); //domain_aliases

            // INDUSTRY INFORMATION 
            var industry = JSON.parse(body).category.industry; //category___industry
            var industryGroup = JSON.parse(body).category.industryGroup; //industry_group
            var industrySector = JSON.parse(body).category.sector; //category_sector
            var subIndustry = JSON.parse(body).category.subIndustry; //category___sub_industry

            // TECH INFORMATION
            var tags = JSON.parse(body).tags.join(","); //tags;
            var tech = JSON.parse(body).tech.join(","); //tech;
            var techCategories = JSON.parse(body).techCategories.join(","); //tech_categories;

            //SOCIAL INFORMATION
            var facebookedHandle = JSON.parse(body).facebook.handle; //facebook_handle
            var twitterHandle = JSON.parse(body).twitter.handle; //twitter_handle
            var linkedInHandle = JSON.parse(body).linkedin.handle; //linkedin_handle

            //LOCATION INFORMATION
            var location = JSON.parse(body).location; // location
            var geoCity = JSON.parse(body).geo.city; //geo___city
            var geoCountry = JSON.parse(body).geo.country; //geo___country
            var geoCountryCode = JSON.parse(body).geo.countryCode; //geo___country_code
            var geoPostalCode = JSON.parse(body).geo.postalCode; //geo___postal_code
            var geoState = JSON.parse(body).geo.state; //geo___state
            var geoStateCode = JSON.parse(body).geo.stateCode; //geo___state_code

            //FIRMOGRAPHIC INFORMATION (METRICS)
            var alexaGlobalRank = JSON.parse(body).metrics.alexaGlobalRank; //metrics___alexa_global_rank
            var alexaUsRank = JSON.parse(body).metrics.alexaUsRank; //metrics___alexa_us_rank
            var annualRevenue = JSON.parse(body).metrics.annualRevenue; //metrics___annual_revenue
            var employees = JSON.parse(body).metrics.employees; //metrics___employees
            var employeesRange = JSON.parse(body).metrics.employeesRange; //metrics___employees_range
            var estimatedAnnualRevenue = JSON.parse(body).metrics.estimatedAnnualRevenue; //metrics___estimated_annual_revenue
            var fiscalYearEnd = JSON.parse(body).metrics.fiscalYearEnd; //metrics___fiscal_year_end
            var marketCap = JSON.parse(body).metrics.marketCap; //metrics___market_cap
            
            //Using the data returned update the relevant company properties within Hubspot.
            hubspotClient.crm.companies.basicApi.update(event.object.objectId, 
                { 
                	"properties": 
                	{ 
                      "company_name": companyName, 
                      "legal_name": legalName, 
                      "phone_number": phoneNumber, 
                      "type_of_company": companyType, 
                      "ticker": ticker, 
                      "founded_year": foundedYear, 
                      "description": description, 
                      "parent_domain": parentDomain,
                      "ultimate_parent_domain": ultimateParent,
                      "domain_aliases": domainAliases,
                      "category___industry": industry,
                      "industry_group": industryGroup,
                      "category_sector": industrySector,
                      "category___sub_industry": subIndustry,
                      "tags": tags,
                      "tech": tech,
                      "tech_categories": techCategories,
                      "facebook_handle": facebookedHandle,
                      "twitter_handle": twitterHandle,
                      "linkedin_handle": linkedInHandle,
                      "location": location,
                      "geo___city": geoCity,
                      "geo___country": geoCountry,
                      "geo___country_code": geoCountryCode,
                      "geo___postal_code": geoPostalCode,
                      "geo___state": geoState,
                      "geo___state_code": geoStateCode,
                      "metrics___alexa_global_rank": alexaGlobalRank,
                      "metrics___alexa_us_rank": alexaUsRank,
                      "metrics___annual_revenue": annualRevenue,
                      "metrics___employees": employees,
                      "metrics___employees_range": employeesRange,
                      "metrics___estimated_annual_revenue": estimatedAnnualRevenue,
                      "metrics___fiscal_year_end": fiscalYearEnd,
                      "metrics___market_cap": marketCap
                	}
                });
            
            // Optional but we could provide data output to use as an input in the Copy to Property workflow action at a later stage.
            callback({ outputFields: {} });

            if (error) throw new Error(error);
            console.log(response.body);
        });
    });
}
