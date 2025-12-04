import express from "express";
import connectDB from "./dbconfig.js";
import Task from "./Task.js";
import User from "./userModel.js";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "./authMiddleware.js";

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

/* ---------------- REGISTER ---------------- */
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists)
      return res.json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ userId: userExists._id }, "jat123", {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- ADD TASK ---------------- */
app.post("/add-task", auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    const newTask = new Task({
      title,
      description,
      userId: req.userId,
    });

    await newTask.save();

    res.json({
      success: true,
      message: "Task added successfully",
      task: newTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- GET USER TASKS ---------------- */
app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- DELETE TASK ---------------- */
app.delete("/delete-task/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    await Task.findOneAndDelete({ _id: id, userId: req.userId });

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- UPDATE TASK ---------------- */
app.patch("/update-task/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json({ success: true, task: updated });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/* ---------------- TOGGLE TASK ---------------- */
app.patch("/toggle-task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task)
      return res.status(404).json({ success: false, message: "Not found" });

    task.completed = !task.completed;
    await task.save();

    res.json({
      success: true,
      task,
      message: `Task marked as ${task.completed ? "Completed" : "Pending"}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.listen(3200, () => console.log("Server running on port 3200"));
