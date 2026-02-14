const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Stats route (must be before :id route)
router.get('/stats', activityController.getActivityStats);

// Get activities by related contact/lead
router.get('/related/:relatedTo/:relatedId', activityController.getActivitiesByRelated);

// CRUD routes
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivity);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;
