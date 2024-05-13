import { Router } from "express";
import { UserModel } from "../models/userModel.mjs";
import { TaskModel } from "../models/taskModel.mjs";
const router = Router()

router.post('/register', async (req, res)=>{
    console.log(req.body);
    const {name, email, password} = req.body
    try{
        const user = await UserModel.create({name, email, password})
        console.log('User Created Successfully');
        req.session.user = user
        res.send({
            success:true,
            data:user.name,
            message:'user created successfully'
        })
    }catch(err){
        console.error(err);
        if(err.code == 11000){
            res.send({
                success:false,
                message:'A user already exists with that email.'
            })
        }else{
            res.send({
                success:false,
                message:'User Registration Failed'
            })
        }
    }
})

router.post('/login', async (req, res)=>{
    const {email, password} = req.body
    console.log(email,password);
    try{
        const user = await UserModel.findOne({email:email})
        if(!user) throw new Error('No user present with this email. Please "Register" to continue.')
        console.log(`${user.name} user present`);
        const userPresent = await user.validatePassword(password)
        if(!userPresent) throw new Error('Email (or) Password incorrect. Please check and try again.')
        req.session.user = user
        console.log(`${user.name} Login Successful`);
        
        user.lastLogin = Date.now()
        user.save().then(()=>{console.log(user);})
        res.send({
            success:true,
            data:user.name,
            message:'Login Successful'
        })
    }catch(err){
        console.error(err);
        res.send({
            success:false,
            message:err.message
        })
    }
})

router.get('/get-all-tasks', async(req, res)=>{
    
    try{
        const tasks = await TaskModel.find({})
        console.log(tasks);
        res.send({
            success:true,
            data:tasks,
            message:'Data fetched successfully'
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