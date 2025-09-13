import connect from "@/lib/db";
import Category from "@/lib/models/categories";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";


export const GET = async (request: Request) => {
    try{
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid user id"},
                { status: 400 }
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"},
                { status: 404 }
            );
        }
        const categories = await Category.find({
            user: new Types.ObjectId(userId) // either use this or just direct pass the userId
        });
        if(!categories){
            return NextResponse.json(
                {message: `No category found for user: ${user.username}`},
                { status: 400 }
            );
        }
        return NextResponse.json(
            {message: "User category fetched!", categories: categories.map(cat => cat.toObject())},
            { status: 200 }
        );
    }catch(err: any){
        return NextResponse.json(
            {error: "Error getting category: " + err.message},
            { status: 500 }
        );
    }
}

export const POST = async (request: Request) => {
    try{
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        const {title} = await request.json();
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid user id"},
                {status: 400}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 404}
            );
        }
        const newCategory = new Category({
            title,
            user: userId // or 'new Tyepes.ObjectId(userId)'
        });
        await newCategory.save();
        return NextResponse.json(
            {message: `category '${newCategory.title}' successfully created for ${user.username}`, category: newCategory.toObject()},
            {status: 200}
        );
    }catch(err: any){
        return NextResponse.json(
            {error: "Error creating category: " + err.message}, {status: 500}
        );
    }
}