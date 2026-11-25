const Task = require('../models/Task');

const createTask = (taskData) => Task.create(taskData);

const getTasks = async ({ filter, skip, limit }) => {
  const [total, data] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return { total, data };
};

module.exports = { createTask, getTasks };
