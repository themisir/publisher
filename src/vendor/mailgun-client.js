const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(require("form-data"));

exports.createClient = (options) => mailgun.client(options);
