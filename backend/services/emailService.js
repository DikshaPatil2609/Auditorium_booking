const nodemailer = require('nodemailer');

// For development and testing, we use Ethereal Email.
// It generates fake emails and provides a URL to view the sent message in your browser.
let transporter;

async function initTransporter() {
    if (!transporter) {
        // Generate a fake testing account
        let testAccount = await nodemailer.createTestAccount();

        // Create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log("Email Transporter Initialized with Ethereal User:", testAccount.user);
    }
    return transporter;
}

exports.sendAdminNotification = async (bookingDetails, studentName) => {
    try {
        const t = await initTransporter();
        const info = await t.sendMail({
            from: '"CampusBook System" <noreply@campusbook.edu>',
            to: "admin@college.edu", // Send to our hardcoded admin
            subject: `New Auditorium Booking Request - ${bookingDetails.event_name}`,
            html: `
                <h3>New Booking Request</h3>
                <p>Hello Admin,</p>
                <p><strong>${studentName}</strong> has requested an auditorium booking.</p>
                <ul>
                    <li><strong>Event:</strong> ${bookingDetails.event_name}</li>
                    <li><strong>Start Time:</strong> ${new Date(bookingDetails.start_time).toLocaleString()}</li>
                    <li><strong>End Time:</strong> ${new Date(bookingDetails.end_time).toLocaleString()}</li>
                </ul>
                <p>Please log in to the CampusBook Admin Portal to approve or reject this request.</p>
            `,
        });

        console.log("Admin Notification Sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending admin notification email:", error);
    }
};

exports.sendUserNotification = async (userEmail, userName, bookingDetails, status) => {
    try {
        const t = await initTransporter();
        const color = status === 'approved' ? 'green' : 'red';
        const info = await t.sendMail({
            from: '"CampusBook System" <noreply@campusbook.edu>',
            to: userEmail,
            subject: `Update on your Booking Request: ${bookingDetails.event_name}`,
            html: `
                <h3>Booking Request Update</h3>
                <p>Hello ${userName},</p>
                <p>Your request for the event <strong>${bookingDetails.event_name}</strong> has been <strong style="color: ${color}; text-transform: uppercase;">${status}</strong> by the administration.</p>
                <p>Details:</p>
                <ul>
                    <li><strong>Time:</strong> ${new Date(bookingDetails.start_time).toLocaleString()} to ${new Date(bookingDetails.end_time).toLocaleString()}</li>
                </ul>
                <p>Thank you for using CampusBook.</p>
            `,
        });

        console.log("User Notification Sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending user notification email:", error);
    }
};
