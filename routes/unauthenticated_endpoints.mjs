import { Router } from "express";
import {TaskModel} from '../models/taskModel.mjs'
import {taskRunner} from '../task-runner/scraper.mjs'
import taskChecker from "../task-runner/taskChecker.mjs";
const router = Router()



router.get('/run/:shorturl', async (req, res) => {
    try {
        const task = await TaskModel.findOne({ shortURL: req.params.shorturl })

        if(!task){
            res.statusCode = 400
            res.send({
                success:false,
                message:'Task doesn\'t exist'
            })
            return
        }

        if(!task.active){
            res.statusCode = 404
            res.send({
                success:false,
                message:'Trying to execute disabled task.'
            })
            return
        }

        for(const param in req.query){
            if(task.params.has(param)){
                
                const oldParam = task.params.get(param)
                task.params.set(param, 
                    { name:oldParam.name,
                        _id:oldParam._id,
                        value:req.query[param]
                    }
                )
            }
        }

        const result = await req.cluster.execute(task, taskRunner)

        task.timesUsed = task.timesUsed +1
        task.lastUsed = Date.now()
        task.save().then(()=>console.log(task))

        res.send({
            success: true,
            data: result,
            message: "Data Fetched Successfully"
        })

    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            data: '',
            message: e.message
        })
    }
})

router.post('/test-task', async (req, res) => {
    req.session.tests = (req.session.tests || 0) + 1
    console.log(req.session);
    if(req.session.tests > 3){
        res.redirect('/')
        return
    }

    const { task } = req.body
    const params = task.params
    task.params = new Map()
    for(const param in params){
        task.params.set(param, {
            name:params[param].name,
            value:params[param].value
        })
    }

    try {
        const result = await req.cluster.execute(task, taskRunner)
        console.log(result);
        res.send({
            success: true,
            data: result,
            message: 'Data Fetched successfully'
        })
    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            message: e.message
        })
    }


})

export default router