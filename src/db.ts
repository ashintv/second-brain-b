import mongoose, { model , Schema } from "mongoose";
import { string } from "zod";


const UserSchema = new Schema({
        username: {type:String , unique:true , required:true },
        password: {type:String ,  required:true}

})


const ContentSchema = new Schema({
        title:{type:String , required:true},
        link:String,
        tags:[{type:mongoose.Types.ObjectId , ref:'Tag'}],
        UserID:{type:mongoose.Types.ObjectId , ref:'user' , required:true},
        Type:{type:String , required:true}
})

const LinkSchema = new Schema({
        userID :{type:mongoose.Types.ObjectId, required:true  , ref:'user'},
        hash:{type:String, required:true}
})


export const ContentModel = model('content' , ContentSchema)
export const UserModel = model('user' ,UserSchema)
export const LinkModel = model('share' , LinkSchema)

