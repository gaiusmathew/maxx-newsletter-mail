const mysql = require("mysql");
require("dotenv").config();

// Create connection to db on start/called
const dbConnection = mysql.createConnection({
    host: process.env.TYPEORM_HOST,
    user: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
});

module.exports = class Database {
    // Method to execute query and returs results/errors
    async executeQuery(query) {
        console.log("query", query);
        return new Promise(async (resolve, reject) => {
            try {
                const queryResult = await dbConnection.query(query);
                resolve(queryResult.rows);
            } catch (e) {
                console.log("e", e);
                reject(e);
            }
        });
    }

    // Method to create user, return success or failure
    async createNewCustomer(customerDetails) {
        let { firstName, lastName, email, age } = customerDetails;
        return this.executeQuery(
            `INSERT INTO customer(firstname, lastname, email, age) VALUES ('${firstName}', '${lastName}', '${email}', ${age})`
        );
    }

    async findResults(query) {
        return new Promise((resolve, reject) => {
            dbConnection.query(query, (error, results, fields) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    async getCustomerByEmail(customerEmail) {
        if (!customerEmail) return 0;
        return this.findResults(
            `SELECT * FROM customer WHERE email='${customerEmail}'`
        );
    }

    async updateNewsLetterLog(customerEmail, newsLetterName, mailStatus) {
        // In logs set the default time for updated_on and created_on as current time in table itself for convenience
        return this.executeQuery(
            `INSERT INTO logs(customer_email, created_on, updated_on, newsletter_name) VALUES ('${customerEmail}', '${newsLetterName}')`
        );
    }
};
