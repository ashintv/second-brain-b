import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export const  AuthMiddlware = (req:Request , res: Response , next: NextFunction ) => {
        const header = req.headers["authorization"]
        console.log(header)
        next()
}