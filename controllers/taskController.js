const mongoose = require('mongoose');
const taskService = require('../services/taskService');

const validStatuses = ['pending', 'in-progress', 'done'];

const createTask = async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }

  const { title, status, dueDate, userId } = body;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string.' });
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'status must be pending, in-progress, or done.' });
  }

  if (
    dueDate !== undefined &&
    dueDate !== null &&
    (typeof dueDate !== 'string' || Number.isNaN(Date.parse(dueDate)))
  ) {
    return res.status(400).json({ error: 'dueDate must be a valid date.' });
  }

  if (
    userId !== undefined &&
    userId !== null &&
    (typeof userId !== 'string' || !mongoose.isValidObjectId(userId))
  ) {
    return res.status(400).json({ error: 'userId must be a valid User id.' });
  }

  try {
    const task = await taskService.createTask({ title, status, dueDate, userId });
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const getTasks = async (req, res, next) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10);
  const { status } = req.query;

  if (page === null || limit === null) {
    return res.status(400).json({ error: 'page and limit must be positive integers.' });
  }

  if (status !== undefined && (typeof status !== 'string' || !validStatuses.includes(status))) {
    return res.status(400).json({ error: 'status must be pending, in-progress, or done.' });
  }

  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    return res.status(400).json({ error: 'page and limit are too large.' });
  }

  const filter = status === undefined ? {} : { status };

  try {
    const { total, data } = await taskService.getTasks({ filter, skip, limit });
    return res.json({ total, page, limit, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTask, getTasks };
