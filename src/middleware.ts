import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { JWT_KEY } from "./config";

export const AuthMiddlware = (req: Request, res: Response, next: NextFunction) => {
        try {
                const header = req.headers["authorization"]
                //@ts-ignore
                const decode = jwt.verify(header as string, JWT_KEY)
                if (decode) {
                        //@ts-ignore
                        req.userID = decode.id
                        next()
                }
                else {
                        res.status(400).json({msg:'please signin again'})
                }
        }
        catch(e:any){
                res.status(400).json(e)
        }
}