import express from "express"
import connectDB from "./dbconfig.js";
import Task from "./Task.js";
import cors from'cors';

 const app = express();
 app.use(express.json());
 app.use(cors())
 connectDB()

 app.post("/add-task", async(req,resp) =>{
    try {
        const{title ,description}= req.body;
        const newTask = new Task({title,description});
        await newTask.save();
        resp.send({
            success: true,
      message: "Task added successfully",
            task:newTask
        })
        
    } catch (error) {
         console.error(error);
    }
 })
 app.get("/tasks", async (req,resp) => {
    try {
        const allTasks = await Task.find()
        resp.send({
            tasks:allTasks
        })

    } catch (error) {
         console.error("Error fetching tasks:", error);
    }
 })

 app.delete("/delete-task/:id",async(req,resp) =>{
    try {
        const {id} =req.params;
        await Task.findByIdAndDelete(id);
        resp.send({message:"task deleted sucessfully"})
    } catch (error) {
            console.error("Error deleting task:", error);
    }
 })

 app.patch("/update-task/:id",async(req,resp) =>{
    const {id} =req.params;
    const update = await Task.findByIdAndUpdate(id,req.body)
    resp.send({success:true, task:update})
 })

 app.patch("/toggle-task/:id",async(req ,res) => {
    try {
        const {id} =req.params;
        const task = await Task.findById(id);
        if(!task) {
            return res.status(404).json({ success:false,message:"not found"})
        }
        task.completed =!task.completed;
        await task.save()
        res.status(200).json({success:true,task,message:`Task marked as ${task.completed ? "Completed" : "Pending"}`})
    } catch (error) {
     res.status(500).json({ success: false, message: "Server Error" });

    }
 })

 app.listen(3200)