import { Router } from "express";
export const authenticate = Router().use((req,res,next)=>{
    if(!req.session.user){
        res.statusCode = 401
        res.send({
            success:'false',
            message:'Unauthorized'
        })
    }else{
        next()
    }
})
