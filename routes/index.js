var express = require('express');
var router = express.Router();
var Queue = require('bull');
var calendarQueue = new Queue('calendar');

/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', { title: 'Demo Bull', message: 'Simple Bull queue example!' });
});

/* GET clean queue page. */
router.get('/clear', function (req, res) {
	var queue = new Queue('calendar');
	['delayed', 'wait', 'active', 'completed', 'failed'].map((status) => {
		queue.clean(0, status);
	})
	const multi = queue.multi();
	multi.del(queue.toKey('repeat'));
	multi.exec();
	res.render('index', { title: 'Clean Queue', message: 'Cleared all queue!' });
});

/* POST booking request */
router.post('/booking', function (req, res) {
	calendarQueue.add('checkinProcess', { email: req.body.email, id: 123456 }, { jobId: 123456 + '_checkin', removeOnComplete: true });
	calendarQueue.add('supplierApproval', { email: req.body.email, id: 123456 }, { jobId: 123456 + '_approval', removeOnComplete: true });
	// calendarQueue.add('supplierApproval', {email: req.body.email}, {jobId: 123456, repeat: {cron: '0 * * * *', limit: 2}});
	res.render('book', { status: 'success', body: req.body, title: 'Booking', message: 'Booking succesfullly!' });
})

/* GET booking request form */
router.get('/booking', function (req, res) {
	res.render('book', { title: 'Booking', message: 'This is booking place!' });
})

/* GET supplier booking request page */
router.get('/supplier/request/:email/:jobId', function (req, res) {
	res.render('supplier', { title: 'Supplier Request', message: 'Approve or Reject a booking!', email: req.params.email, jobId: req.params.jobId });
})

/* POST supplier confirmation request */
router.post('/supplier/request/:email/:jobId', function (req, res) {
	calendarQueue.add('bookingStatus', { email: req.params.email, status: req.body.request, id: 123456 }, { jobId: 123456 + '_booking', removeOnComplete: true });
	res.render('supplier', { title: 'Supplier Request', message: 'Result!', status: req.body.request });
})

module.exports = router;
