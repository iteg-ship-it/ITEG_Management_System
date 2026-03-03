const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      maxlength: [150, 'Topic name cannot exceed 150 characters']
    },
    syllabusVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SyllabusVersion',
      required: [true, 'SyllabusVersion reference is required'],
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

topicSchema.index({ syllabusVersionId: 1, subjectId: 1, order: 1 });
topicSchema.index({ subjectId: 1, isActive: 1 });

module.exports = mongoose.model('Topic', topicSchema);
