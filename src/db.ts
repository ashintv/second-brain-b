import { model , Schema } from "mongoose";
import { string } from "zod";


const UserSchema = new Schema({
        username: {type:String , unique:true , required:true },
        password: {type:String ,  required:true}

})

export const UserModel = model('user' ,UserSchema)

