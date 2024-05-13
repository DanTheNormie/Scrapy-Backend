import mongoose, { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
const SALT_WORK_FACTOR = 10

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    lastLogin:{
        type:Date,
        required:true,
        default:()=>Date.now()
    },
    registrationDate:{
        type:Date,
        required:true,
        default:()=>Date.now()
    },
    tasks:{
        type:[Schema.Types.ObjectId],
        ref:'Task'
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    try{
        this.password = await bcrypt.hash(this.password,SALT_WORK_FACTOR)
        return next()
    }catch(err){
        return next(err)
    }
})

userSchema.methods.deleteAllTasks = async function(){
    this.tasks.forEach( async (taskId)=>{

        console.log(`Deleting Task with id : ${taskId}`);
        await this.model('Task').deleteOne({_id:taskId})
    })
}

userSchema.methods.validatePassword = async function(data){
    return await bcrypt.compare(data,this.password)
}

export const UserModel =  mongoose.model('User', userSchema)
