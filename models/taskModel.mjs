import {Schema, model} from "mongoose";
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
    }
})

export const taskModel = model('Task-Model', taskSchema)
