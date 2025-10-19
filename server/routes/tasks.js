// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks - return grouped tasks by bucket (and include list field)
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    const grouped = { today: [], tomorrow: [], week: [] };
    tasks.forEach(t => {
      const b = t.bucket || 'today';
      if (!grouped[b]) grouped[b] = [];
      grouped[b].push(t);
    });
    res.json(grouped);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - create task (accepts optional list)
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      bucket = 'today',
      list = null,
      startDate,
      expectedCompletion
    } = req.body;

    if (!title || typeof title !== 'string') return res.status(400).json({ message: 'Title is required' });

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      bucket,
      list: list ? String(list) : null,
      startDate: startDate ? new Date(startDate) : undefined,
      expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : undefined
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - update (supports list)
router.put('/:id', async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.expectedCompletion) updates.expectedCompletion = new Date(updates.expectedCompletion);
    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
