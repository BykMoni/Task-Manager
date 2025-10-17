// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasksController');

// GET /api/tasks  -> returns grouped tasks { today:[], tomorrow:[], week:[] }
router.get('/', ctrl.list);

// POST /api/tasks  -> create a task { title, description?, bucket? }
router.post('/', ctrl.create);

// GET /api/tasks/:id
router.get('/:id', ctrl.get);

// PUT /api/tasks/:id
router.put('/:id', ctrl.update);

// DELETE /api/tasks/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
