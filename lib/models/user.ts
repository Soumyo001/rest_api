import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
    {
        email: {type:"string", require:true, unique:true},
        username: {type:"string", require:true, unique:true},
        password: {type:"string", require:true}
    },
    {
        timestamps: true
    }
);

const User = models.User || model("User", UserSchema);
export default User;
