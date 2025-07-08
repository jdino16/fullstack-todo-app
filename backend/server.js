const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Todo schema & model
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ["Homework", "Office Work"], required: true },
  status: {
    type: String,
    enum: ["Not Started", "Pending", "Completed"],
    default: "Not Started",
  },
  created_at: { type: Date, default: () => new Date() },
  modified_at: { type: Date, default: () => new Date() },
});

todoSchema.pre("save", function (next) {
  this.modified_at = new Date();
  next();
});

todoSchema.pre("findOneAndUpdate", function (next) {
  this._update.modified_at = new Date();
  next();
});

const Todo = mongoose.model("Todo", todoSchema);

// Create TODO
app.post("/api/todos", async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/todos", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      categories,
      status,
      modifiedStart,
      modifiedEnd,
      showCompleted = "false",
    } = req.query;

    const filter = {};

    if (showCompleted === "false") {
      filter.status = { $ne: "Completed" };
    }

    // Search in title & description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by categories (comma separated)
    if (categories) {
      const categoriesArr = categories.split(",");
      filter.category = { $in: categoriesArr };
    }

    // Filter by status (comma separated)
    if (status) {
      const statusArr = status.split(",");
      if (filter.status) {
        filter.status.$in = statusArr;
      } else {
        filter.status = { $in: statusArr };
      }
    }

    // Filter by modified date range
    if (modifiedStart || modifiedEnd) {
      filter.modified_at = {};
      if (modifiedStart) filter.modified_at.$gte = new Date(modifiedStart);
      if (modifiedEnd) filter.modified_at.$lte = new Date(modifiedEnd);
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const todos = await Todo.find(filter)
      .sort({ created_at: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalCount = await Todo.countDocuments(filter);

    res.json({ todos, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update TODO by id
app.put("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ error: "TODO not found" });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete TODO by id
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "TODO not found" });
    res.json({ message: "TODO deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));