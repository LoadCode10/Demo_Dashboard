const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    owner:{
      type: String,
      required: true,
      trim: true
    },
    title:{
      type: String,
      required: true,
      trim: true
    },
    taskStatus:{
      type: String,
      enum: ['In Queue', 'In Progress', 'Done', 'On Review'],
      default: "In Queue",
      required: true
    },
    taskPriority:{
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    dueDate:{
      type: Date,
      required: true
    },
    member:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task',taskSchema);