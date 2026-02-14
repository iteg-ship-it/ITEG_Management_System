const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, required: true, enum: ['1A', '1B', '1C', '2A', '2B', '2C'] },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const StudentTaskSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmittedStudent', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  notes: { type: String, default: '' },
  completedAt: { type: Date },
  submissionUrl: { type: String }
}, { timestamps: true });

const Task = mongoose.model("Task", TaskSchema);
const StudentTask = mongoose.model("StudentTask", StudentTaskSchema);

module.exports = { Task, StudentTask };