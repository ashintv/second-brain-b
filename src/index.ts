import express from "express";
import z, { literal, string } from "zod";
import { ContentModel, LinkModel, UserModel } from "./Mogo";
import bcrypt, { compareSync, hash } from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { DB_URL, JWT_KEY } from "./config";
import { AuthMiddlware } from "./middleware";
import { randomHash } from "./util";
import cors from "cors";
// const JWT_KEY = 'ashintv'

const UserZSchema = z.object({
    username: z
        .string()
        .min(6, { message: "username should be atleast 5 charecter or more " }),
    password: z
        .string()
        .min(8, { message: "password must be atleaste 8 charecter long" })
        .regex(/[a-z]/, { message: "must contain a lowercase" })
        .regex(/[A-Z]/, { message: "must contain a uppercase" })
        .regex(/[0-9]/, { message: "must contain a number" })
        .regex(/[^a-zA-Z0-9]/, { message: "must contain a special charecter" }),
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signin", async (req, res) => {
    const Parse = UserZSchema.safeParse(req.body);
    if (Parse) {
        const user = await UserModel.findOne({
            username: req.body.username,
        });
        //@ts-ignore
        console.log(user.username, JWT_KEY);

        if (!user) {
            res.status(400).json({ msg: "Incorrect Username" });
            return;
        }

        // @ts-ignore
        const passCheck = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (passCheck) {
            //@ts-ignore
            const token = jwt.sign({ id: user._id }, JWT_KEY);
            res.status(200).json({ token });
        } else {
            res.status(400).json({ msg: "Incorrect Password" });
            return;
        }
    }
});

app.post("/api/v1/signup", async (req, res) => {
    const Parse = UserZSchema.safeParse(req.body);
    if (Parse.success) {
        const hash = await bcrypt.hash(req.body.password, 5);
        try {
            await UserModel.create({
                username: req.body.username,
                password: hash,
            });
            res.status(200).json({
                message: "User signed up successfully",
            });
            return;
        } catch (e: unknown) {
            res.status(500).send(e);
            return;
        }
    }
    res.status(400).send(Parse.error);
});

app.get("/api/v1/content", AuthMiddlware, async (req, res) => {
    try {
        const data = await ContentModel.find({
            //@ts-ignore
            UserID: req.userID,
        }).populate({
            path: "UserID",
            select: "-password",
        });

        res.status(200).json(data);
    } catch (e) {
        res.status(400).json({
            msge: "unable fetch your data",
        });
    }
});

app.post("/api/v1/content", AuthMiddlware, async (req, res) => {
    const ContentF = z.object({
        title: z.string(),
        link: z.string(),
    });
    const Parse = ContentF.safeParse(req.body);
    if (Parse.success) {
        try {
            await ContentModel.create({
                title: req.body.title,
                link: req.body.link,
                tags: req.body.tags,
                //@ts-ignore
                UserID: req.userID,
                Type: req.body.Type,
            });
            res.status(200).json({ Parse });
        } catch (e) {
            res.status(400).json(e);
            return;
        }
    } else {
        res.status(400).json(Parse.error);
    }
});

app.delete("/api/v1/content", AuthMiddlware, async (req, res) => {
    try {
        //@ts-ignore
        console.log(req.userID);
        const data = await ContentModel.deleteOne({
            _id: req.body._id,
            //@ts-ignore
            UserID: req.userID,
        });
        res.status(200).json(data);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post("/api/v1/brain/share", AuthMiddlware, async (req, res) => {
    const { share } = req.body;
    if (share) {
        try {
            const Existing = await LinkModel.findOne({
                //@ts-ignore
                userID: req.userID,
            });
            if (Existing) {
                res.status(200).json({
                    hash: Existing.hash,
                });
                return;
            }
        } catch (e) {
            res.status(400).json(e);
        }
        const hash = randomHash(10);
        try {
            const Save = await LinkModel.create({
                //@ts-ignore
                userID: req.userID,
                hash: hash,
            });
            res.json({
                hash,
            });
        } catch (e) {
            res.status(400).json(e);
        }
    } else {
        console.log(share);
        const del = await LinkModel.deleteOne({
            //@ts-ignore
            userID: req.userID,
        });
        res.status(200).json(del);
    }
});

app.get("/api/v1/brain/share/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    try {
        const link = await LinkModel.findOne({
            hash: hash,
        });
        if (!link) {
            res.status(400).json({
                msg: "Unable to fetch data please check the link",
            });
            return;
        }
        const user = await UserModel.findOne({
            _id: link?.userID,
        });

        const content = await ContentModel.find({
            UserID: link.userID,
        });
        res.status(200).json({
            username: user?.username,
            content: content,
        });
    } catch (e) {
        res.status(400).json(e);
    }
});

if (DB_URL) {
    mongoose.connect(DB_URL);
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
}else{
        console.log("DB_ERROR")
}
