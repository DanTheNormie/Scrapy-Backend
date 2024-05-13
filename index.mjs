import express from 'express'
const app = express()
import cors from 'cors'
import { Cluster } from 'puppeteer-cluster';
import { addExtra } from 'puppeteer-extra';
import vanillaPuppeteer from 'puppeteer'
import Stealth from 'puppeteer-extra-plugin-stealth'
import mongoose from 'mongoose';
import session from 'express-session';
import { captain } from './routes/captain.mjs';

let cluster;

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:true,
    credentials:true
}))
app.use(session({
    saveUninitialized:true,
    resave:false,
    secret:'Very Secret',
    cookie:{
        httpOnly:true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.use((req,res,next)=>{
    req.cluster = cluster
    next()
})


app.use(captain)


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