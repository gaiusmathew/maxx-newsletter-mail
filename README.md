# maxx-newsletter-mail

# Sending newsletter mails to customers by reading data from CSV

This package helps to trigger mails to customers via RabbitMQ, Nodemailer and AWS:

Steps for starting this project:

1. Clone this repo or download all files. [maxx-newsletter-mail](https://github.com/gaiusmathew/maxx-newsletter-mail)
2. Run Yarn or NPM from the root folder to install all dependencies.
3. We need to run two Node process to see Sender and Consumer | email data consuming from channel.
4. Make sure to substitute the env variables in .env file
5. Execute the below codes in two different terminals

    ```
    node .							# Run node instance
    node consumer-worker.js       	# Run consumer worker instance
    ```

6. After executing these commands, you can see the status of request made to the queue in terminal 1, first node will be stopped after sending request to queue
7. The second terminal will actively display status of the message received from the queue and mail triggered status
8. After successfully sending mail to customer, a log will be added to logs table, in-case of failure the data will be added to a new queue to be processed.

Structure:

```
maxx-newsletter-mail/
├── index.js/           			# All the methods are connected here, creating sample users, parsing a csv etc.
├── sample-data/   					# Sample data folder with sample users and sample csv file
├── .env/       					# Store your env variables for ease of access
├── database.js/					# All database related queries and executions
├── email-sender.js/				# Email sender class to trigger mails by SMTP
├── views/							# Folder to store your email template files
```

If you get stuck anywhere please report it at [issues](https://github.com/gaiusmathew/maxx-newsletter-mail/issues/new)
