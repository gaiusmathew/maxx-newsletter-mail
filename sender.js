var amqp = require("amqplib/callback_api");
var queue = "newsletter-mail";
require("dotenv").config();

const publishMessage = (payload) =>
    amqp.connect(process.env.AMPS_CONNECT_URL, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(queue, {
                durable: false,
            });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

            console.log(" [x] Sent %s", payload);
        });

        // Close connection after sending requests
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });

module.exports = { publishMessage };
