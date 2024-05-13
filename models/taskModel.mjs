import mongoose, {Schema, model} from "mongoose";
import { nanoid } from "nanoid";

const paramSchema = Schema({
    name:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:true
    }
})

const selectorSchema = Schema({
    name:{
        type:String,
        required:true
    },
    selector:{
        type:String,
        required:true
    },
    target:{
        type:String,
        required:true
    },
    format:{
        type:String,
        required:true
    }
})

const taskSchema = Schema({
    name:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    params:{
        type:Map,
        of:paramSchema
    },
    selectors:{
        type:[selectorSchema]
    },
    taskOptions:{
        parentElementSelector:String,
        format:{
            type:String,
            required:true
        },
        dataOrder:[String],
        waitForSelector:String
    },
    shortURL:{
        type:String,
        required:true,
        default:()=>nanoid()
    },

    lastUsed:{
        type:Date,
        default:()=>null
    },

    active:{
        type:Boolean,
        required:true,
        default:()=>true
    },

    lastModified:Date,
    timesModified:{
        type:Number,
        required:true,
        default:()=>0
    },

    timesUsed:{
        type:Number,
        required:true,
        default:0
    },
    dateCreated:{
        type:Date,
        required:true,
        default:()=>Date.now()
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        required:true
    }
})

export const TaskModel = model('Task', taskSchema)
