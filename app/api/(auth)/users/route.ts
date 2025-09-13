import connect from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

const ObjectId = require("mongoose").Types.ObjectId;

export const GET = async () => {
    try{
        await connect();
        const users = await User.find();
        return NextResponse.json({users: users.map(user=>user.toObject())}, {status:200});
    }catch(err:any){
        return new NextResponse("Error in fetching users: "+err.message, {status:500});
    }
}

export async function POST(request: Request){
    try{
        await connect();
        const body = await request.json();
        console.log(body);
        const newUser = new User(body);
        console.log(newUser);
        await newUser.save();
        return NextResponse.json(
            {message: "User Created !", user: newUser.toObject()},
            { status: 200 }
        );
    }catch(err:any){
        return new NextResponse("Error in creating new user: " + err.message, {status:500});
    }
}

export const PATCH = async (request: Request) => {
    try{
        const body = await request.json();
        const { userId, userName } = body;
        await connect();
        if(!userId || !userName){
            return NextResponse.json(
                {message: "Invalid username or id."},
                { status: 400 }
            );
        }
        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(
                JSON.stringify({message: "Invalid user id."}),
                { status: 400 }
            );
        }
        const updatedUser = await User.findOneAndUpdate(
            {_id: new ObjectId(userId)}, // can use both new ObjectId(userId) or just simple pass the userId parameter to let mongoose convert it internally.
            {username: userName},
            {new: true}
        );
        if(!updatedUser){
            return new NextResponse(
                JSON.stringify({message: "User not found."}),
                { status: 400 }
            );
        }
        return NextResponse.json(
            {message: "User updated!", user: updatedUser.toObject()},
            { status: 200 }
        );
    }catch(err: any){
        return new NextResponse(
            JSON.stringify("Error updating user: " + err.message),
            {status: 500}
        );
    }

}

export const DELETE = async (request: Request) => {
    try{
        const requestUrl = new URL(request.url);
        console.log(request.url);
        console.log(requestUrl.searchParams);
        const userId = requestUrl.searchParams.get("userId");
        await connect();
        if(!userId){
            return new NextResponse(
                JSON.stringify({message: "Incorrect user id"}), { status: 400 }
            );
        }
        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(
                JSON.stringify({message: "Invalid user id"}), { status: 400 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if(!deletedUser){
            return new NextResponse(
                JSON.stringify({message: "User not found."}), { status: 400 }
            );
        }
        return NextResponse.json(
            {message: `Successfully deleted user ${deletedUser.username}`, user: deletedUser.toObject()}, { status: 200 }
        );
    }catch(err: any){
        return new NextResponse(
            "Error deleting user: " + err.message, { status: 500 }
        );
    }
}