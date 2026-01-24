const express = require('express');
const router = express.Router();
const {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    getLeadFollowUps
} = require('../controllers/followUpController');

router.route('/')
    .get(getFollowUps)
    .post(createFollowUp);

router.route('/:id')
    .put(updateFollowUp)
    .delete(deleteFollowUp);

router.route('/lead/:leadId')
    .get(getLeadFollowUps);

module.exports = router;
