import express from 'express'
const app = express()
import cors from 'cors'
import { Cluster } from 'puppeteer-cluster';
import { addExtra } from 'puppeteer-extra';
import vanillaPuppeteer from 'puppeteer'
import Stealth from 'puppeteer-extra-plugin-stealth'
import mongoose from 'mongoose';
import { taskModel } from './models/taskModel.mjs';
import { taskRunner } from './task-runner/scraper.mjs';
import taskChecker from './task-runner/taskChecker.mjs';
let cluster;

const LOCAL_ADDRESS = 'http://localhost:3000'
const NETWORK_ADDRESS = 'http://192.168.0.101:3000'

app.use(express.json())
app.use(cors())

app.post('/generate-url', async (req, res) => {
    const msg = taskChecker(req.body.task)
    if (msg == 'task is valid') {
        try {
            const task = await taskModel.create(req.body.task)
            console.log(task);

            res.send({
                success: true,
                data: `${NETWORK_ADDRESS}/run/${task.shortURL}`,
                message: "Task stored successfully."
            })
        } catch (e) {
            console.log(e);
            res.send({
                sucess: false,
                data: "Some Error Occured",
                message: "Task Structure is Invalid"
            })
        }
    } else {
        res.send({
            sucess: false,
            data: "Some Error Occured",
            message: msg
        })
    }

})

app.get('/run/:shorturl', async (req, res) => {
    try {
        const task = await taskModel.findOne({ shortURL: req.params.shorturl })
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

        const result = await cluster.execute(task, taskRunner)
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

app.post('/test-task', async (req, res) => {
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
        const result = await cluster.execute(task, taskRunner)
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

app.post('/login', (req, res)=>{

})

app.post('/login', (req, res)=>{
    
})

app.listen(3000, async () => {
    await startCluster()
    await connectDB()
    console.log('running...');
})

const startCluster = async () => {

    const puppeteer = addExtra(vanillaPuppeteer)
    puppeteer.use(Stealth())

    cluster = await Cluster.launch({
        puppeteer,
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5,
    })
    console.log('Puppeteer Browser Started successfully');
}

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost/ScrapeTasksDB')
        console.log('DB connection successful');
    } catch (e) {
        console.error(e);
    }
}