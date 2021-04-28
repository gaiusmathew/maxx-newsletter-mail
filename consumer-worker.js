const dotenv = require("dotenv");
dotenv.config();
var amqp = require("amqplib/callback_api");
var queue = "newsletter-mail";
var failed_queue = "parking-lot-queue";

const Database = require("./database.js");
const db = new Database();

const EmailSender = require("./email-sender.js");
const emailSender = new EmailSender();
require("dotenv").config();

amqp.connect(process.env.AMPS_CONNECT_URL, (error0, connection) => {
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

        console.log(
            " [*] Waiting for messages in %s. To exit press CTRL+C",
            queue
        );

        // Fetch mail details and trigger mail to address
        channel.consume(
            queue,
            async (msg) => {
                // Trigger mail to customer
                let emailData = JSON.parse(msg.content.toString());
                try {
                    const mailSendRes = await emailSender.process(emailData);
                    console.log("mailSendRes", mailSendRes);
                    // Check if mail delivery is successful and update status
                    if (mailSendRes && mailSendRes.accepted) {
                        db.updateNewsLetterLog(
                            emailData.recipient,
                            emailData.subject,
                            mailSendRes.response
                        );
                    }
                } catch (e) {
                    // on failed case, push to failed queue for taking up later
                    console.log("mailSendRes + e", e);
                    channel.assertQueue(failed_queue, {
                        durable: false,
                    });
                    channel.sendToQueue(
                        failed_queue,
                        Buffer.from(JSON.stringify(msg))
                    );
                }
            },
            {
                noAck: true,
            }
        );
    });
});
