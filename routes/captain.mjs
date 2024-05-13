import { Router } from "express";
import authRouter from './auth_endpoints.mjs'
import unAuthRouter from './unauthenticated_endpoints.mjs'
import userRouter from './user_endpoints.mjs'
import { authenticate } from "./middle-ware/auth_middleware.mjs";
const captain = Router()

captain.use(authRouter)

captain.use(unAuthRouter)

captain.use(authenticate)

captain.use(userRouter)


export {captain}
