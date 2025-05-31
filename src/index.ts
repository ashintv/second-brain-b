import express from 'express'
import z, { string } from 'zod'
import { ContentModel, UserModel } from './db'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { JWT_KEY } from './config'
import { AuthMiddlware } from './middleware'
// const JWT_KEY = 'ashintv'


mongoose.connect('mongodb://localhost:27017/SecondBrain')
const UserZSchema = z.object({
        username: z.string().min(6, { message: 'username should be atleast 5 charecter or more ' }),
        password: z.string().min(8, { message: 'password must be atleaste 8 charecter long' })
                .regex(/[a-z]/, { message: 'must contain a lowercase' })
                .regex(/[A-Z]/, { message: 'must contain a uppercase' })
                .regex(/[0-9]/, { message: 'must contain a number' })
                .regex(/[^a-zA-Z0-9]/, { message: 'must contain a special charecter' })
})


const app = express()
app.use(express.json())


app.post('/api/v1/signin', async (req, res) => {
        const Parse = UserZSchema.safeParse(req.body)
        if (Parse) {
                const user = await UserModel.findOne({
                        username: req.body.username,

                })
                //@ts-ignore
                console.log(user.username, JWT_KEY)

                if (!user) {
                        res.status(400).json({ msg: 'Incorrect Username' })
                        return
                }

                // @ts-ignore
                const passCheck = await bcrypt.compare(req.body.password, user.password)
                if (passCheck) {
                        //@ts-ignore
                        const token = jwt.sign({ id: user._id }, JWT_KEY)
                        res.status(200).json(token)
                } else {
                        res.status(400).json({ msg: 'Incorrect Password' })
                        return
                }

        }

})

app.post('/api/v1/signup', async (req, res) => {
        const Parse = UserZSchema.safeParse(req.body)
        if (Parse.success) {
                const hash = await bcrypt.hash(req.body.password, 5)
                try {
                        await UserModel.create({
                                username: req.body.username,
                                password: hash
                        })
                        res.status(200).json({
                                message: 'User signed up successfully'
                        })
                        return

                } catch (e: unknown) {
                        res.status(500).send(e)
                        return
                }
        }
        res.status(400).send(Parse.error)


})


app.get('/api/v1/content', AuthMiddlware, async (req, res) => {
        try {
                const data = await ContentModel.find({
                        //@ts-ignore
                        UserID: req.userID
                })

                res.status(200).json(data)
        } catch (e) {
                res.status(400).json({
                        msge: 'unable fetch your data'
                })
        }

})


app.post('/api/v1/content', AuthMiddlware, async (req, res) => {
        const ContentF = z.object({
                title: z.string(),
                link: z.string(),

        })
        const Parse = ContentF.safeParse(req.body)
        if (Parse.success) {
                try {
                        await ContentModel.create(req.body)
                        res.status(200).json(Parse)
                } catch (e) {
                        res.status(400).json(e)
                        return
                }
        }
        else {
                res.status(400).json(Parse.error)

        }
})

app.delete('/api/v1/content', AuthMiddlware, async (req, res) => {
        try {
                 //@ts-ignore
                console.log(req.userID)
                const data = await ContentModel.deleteOne({
                        _id: req.body._id,
                        //@ts-ignore
                         UserID: req.userID

                })
                 res.status(200).json(data)
        }catch(e){
                res.status(400).json(e)
        }
})


app.post('/api/v1/brain/share', (req, res) => {

})

app.get('api/v1/brain/share/:shareLink', (req, res) => {

})

app.listen(3000)