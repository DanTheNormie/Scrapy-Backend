import { Router } from "express";
import { UserModel } from "../models/userModel.mjs";
import { TaskModel } from "../models/taskModel.mjs";
import taskChecker from "../task-runner/taskChecker.mjs";
const router = Router()

router.get('/get-tasks', async (req, res)=>{

    const user_id = req.session.user
    console.log(user_id);
    try{
        const user = await UserModel.findOne({_id:user_id}).populate('tasks','name _id shortURL dateCreated timesUsed lastUsed active')
        res.send({
            success:true,
            data:user.tasks
        })
    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'Unexpected error occurred.'
        })
    }
})

router.get('/get-task', async(req,res)=>{
    const {taskId} = req.query
    try{
        const task = await TaskModel.findOne({_id:taskId})
        console.log(task);

        if(!task){
            res.send({
                success:false,
                message:'No task with the given ID exists'
            })
        }

        res.send({
            success:true,
            data:task,
            message:'Data Fetched Successfully'
        })

    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'some error occurred'
        })
    }
})

router.post('/generate-url', async (req, res) => {
    const user_id = req.session.user
    const msg = taskChecker(req.body.task)
    const NETWORK_ADDRESS = 'http://192.168.0.109:3000'
    if (msg == 'task is valid') {
        try {
            req.body.task.createdBy = user_id
            const task = await TaskModel.create(req.body.task)
            console.log(task);
            const user = await UserModel.updateOne({_id:user_id}, {$push:{tasks:task._id}})
            console.log(user);
            res.send({
                success: true,
                data: `${NETWORK_ADDRESS}/run/${task.shortURL}`,
                message: "Task stored successfully."
            })
        } catch (e) {
            console.log(e);
            res.send({
                sucess: false,
                message: "Some Error Occured"
            })
        }
    } else {
        res.send({
            sucess: false,
            message: msg
        })
    }

})

router.patch('/toggle-task-activation', async (req, res)=>{
    const {taskId} = req.query

    try{
        const task = await TaskModel.findOne({_id:taskId})
        console.log(task.active);
        task.active = !task.active
        const result = await task.save()
        console.log(result);
        res.send({
            success:true,
            message:'task status toggled'
        })
    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'some error occured'
        })
    }
})

router.patch('/edit-task', async (req, res)=>{
    const newTask = req.body.task
    const {taskId} = req.query
    if(!taskId){
        res.statusCode = 400
        res.send({
            success:false,
            message:'Invalid taskId'
        })
        return
    }
    const msg =  taskChecker(newTask)
    if(msg !== 'task is valid'){
        res.send({
            success:false,
            data:msg,
            message:'Task is Invalid'
        })
        return
    }
    try{
        const task = await TaskModel.findOne({_id:taskId})
        task.name = newTask.name
        task.url = newTask.url
        task.params = newTask.params
        task.selectors = newTask.selectors
        task.resultOptions = newTask.resultOptions
        task.lastModified = Date.now()
        task.timesModified = task.timesModified + 1
        const savedTask = await task.save()
        console.log(savedTask);

        res.send({
            success:true,
            message:'Task Updated Successfully'
        })
    }catch(err){
        console.log(err);
        res.statusCode = 400
        res.send({
            success:false,
            message:'some error occured'
        })
    }

})

router.delete('/delete-task', async (req, res)=>{
    const {taskId} = req.query
    if(!taskId){
        res.send({
            success:false,
            message:'Invalid (or) Empty taskId.'
        })
        return
    }
    try{
        const task =  await TaskModel.deleteOne({_id: taskId})

        console.log(task);

        if(task.deletedCount == 0){
            res.send({
                success:false,
                message:'No Task found with that task-id'
            })
            return
        }

        const user = await UserModel.updateOne({_id:req.session.user},{
            $pull:{
                tasks:taskId
            }
        })

        console.log(user);

        res.send({
            success:true,
            message:'Task deleted successfully'
        })
    }catch(err){
        console.log(err);

        res.send({
            success:false,
            message:'some error occured'
        })
    }
    
})

router.get('/logout', (req, res)=>{
    req.session.user = null
    res.send({
        success:true,
        message:'logged out successfully'
    })
})

router.get('/get-profile', async(req, res)=>{
    try{

        const user = await UserModel.findOne({_id:req.session.user},'name email')
        console.log(user);

        res.send({
            success:true,
            data:user,
            message:'data fetched successfully'
        })

    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'some error occurred'
        })
    }
})

router.patch('/update-name', async (req,res)=>{
    const {newName} = req.query
    if(!newName){
        res.send({
            success:false,
            message:'New Name required to update was not sent'
        })
        return
    }
    try{
        const user = await UserModel.updateOne({_id:req.session.user},{name:newName})

        console.log(user);
        
        res.send({
            success:false,
            message:'Name updated Successfully'
        })

    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'some error occurred'
        })
    }
})

router.delete('/delete-profile', async(req, res)=>{
    const userId = req.session.user
    req.session.user = null
    try{
        const user = await UserModel.findOne({_id:userId})
        await user.deleteAllTasks()
        await UserModel.deleteOne({_id:userId})
        res.send({
            success:true,
            message:'User Deleted successfully'
        })
    }catch(err){
        console.log(err);
        res.send({
            success:false,
            message:'some error occurred'
        })
    }
    
})

export default router