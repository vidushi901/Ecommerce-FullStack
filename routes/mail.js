const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    /* auth: {
        api_key: 'YOUR API KEY',
        domain: 'YOUR DOMAIN NAME'
    } */
};
/* Go to : https://www.google.com/settings/security/lesssecureapps

set the Access for less secure apps setting to Enable if email is sent successfully but not received*/

const transporter = nodemailer.createTransport(mailGun(auth));


const sendMail = (email, subject, message) => {
    const mailOptions = {
        from: email,
        to: 'YOUR EMAIL-ID', 
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log(err);;
        }
    });
}

module.exports = sendMail;