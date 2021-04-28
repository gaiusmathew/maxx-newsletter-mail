const sampleCustomers = require("./sample-data/sample-customers.json");
const Database = require("./database.js");
const db = new Database();
const { publishMessage } = require("./sender.js");
const ParserMethod = require("./csv-parser.js");
const parser = new ParserMethod();

exports.handler = async (event) => {
    // 1. Create sample users on start
    // for (let customer of sampleCustomers) {
    //     await db.createNewCustomer(customer);
    // }

    // 2. Read CSV to find newsletter data
    const parsedData = await parser.importCsvFile("newsletter.csv");
    console.log("parsedData", parsedData);

    // 3. Map newsletter data and send mail to customers
    for (let newsLetter of parsedData.completeNewsLetters) {
        let { customerEmail, newsletterName, newsletterContent } = newsLetter;

        // 4. find the current customer details and attach his name
        let customer = await db.getCustomerByEmail(customerEmail);

        if (customer) {
            console.log("customer", customer);
            let { firstname, lastname } = customer;

            let emailData = {
                subject: newsletterName,
                recipient: customerEmail,
                templateVars: {
                    firstname,
                    lastname,
                    newsletterContent,
                    newsletterName,
                },
            };

            // 5.Publish message to queue
            publishMessage(emailData);
        }
    }

    return;
};

exports.handler();
