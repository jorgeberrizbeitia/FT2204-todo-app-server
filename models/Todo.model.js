const { Schema, model } = require("mongoose")

const todoSchema = new Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  isUrgent: {
    type: Boolean
  }
})

const TodoModel = model("Todo", todoSchema)

module.exports = TodoModel