const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'SubTopic name is required'],
      trim: true,
      maxlength: [200, 'SubTopic name cannot exceed 200 characters']
    },
    syllabusVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SyllabusVersion',
      required: [true, 'SyllabusVersion reference is required'],
      index: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
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

subTopicSchema.index({ syllabusVersionId: 1, topicId: 1, order: 1 });
subTopicSchema.index({ subjectId: 1, topicId: 1 });
subTopicSchema.index({ topicId: 1, isActive: 1 });

module.exports = mongoose.model('SubTopic', subTopicSchema);