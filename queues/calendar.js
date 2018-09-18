var Queue = require('bull');
var nodemailer =  require('nodemailer');
var calendarQueue = new Queue('calendar');

var transporter =  nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '', // Your email
        pass: '' // App less security password
    }
});

var calendarQueueServices = () => {
    
    var bookingStatus = () => calendarQueue.process('bookingStatus', function (job, done) {
        var mainOptions = { // setup mail option and information
            from: 'Supplier 2.0',
            to: job.data.email,
            subject: 'Your Booking status!',
            html: '<p>The Supplier ' + job.data.status + 's your booking! Then you can ' +
                (job.data.status === 'approve' ? 'proceed to the payment step!' : 'book another property!')
                + '</p>'
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
        done();
        // If the job throws an unhandled exception it is also handled correctly
        throw new Error('some unexpected error');
    });

    var supplierApproval = () => calendarQueue.process('supplierApproval', function (job, done) {
        var mainOptions = { // setup mail option and information
            from: 'Supplier 2.0',
            to: 'huy.huynh@metroresidences.com',
            subject: 'Booking Waiting for Approval!',
            html: '<p>Please proceed <a href="http://localhost:3000/supplier/request/' + job.data.email + '/' + job.data.id + '">HERE</a>!!!</p>'
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
        done();
        // If the job throws an unhandled exception it is also handled correctly
        throw new Error('some unexpected error');
    });

    var checkinProcess = () => calendarQueue.process('checkinProcess', function (job, done) {
        var mainOptions = { // setup mail option and information
            from: 'Supplier 2.0',
            to: job.data.email,
            subject: 'MR Booking Notification',
            html: '<p>Your booking for unit "[ID: 123456] Luxury Unit or whatever..." has been processed and waiting for approved!</p>' +
                '<p>You will receive a notification via email when your booking is approved and ready for payment!'
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
        done();
        // If the job throws an unhandled exception it is also handled correctly
        throw new Error('some unexpected error');
    });

    return  {
        registerAllQueues: () => {
            bookingStatus();
            supplierApproval();
            checkinProcess();
        },
        bookingStatus: bookingStatus,
        supplierApproval: supplierApproval,
        checkinProcess: checkinProcess
    }
}

module.exports = calendarQueueServices();