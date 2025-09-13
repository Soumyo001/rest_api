import connect from "@/lib/db";
import Blog from "@/lib/models/blogs";
import Category from "@/lib/models/categories";
import User from "@/lib/models/user";
import { error } from "console";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        const categoryId = requestUrl.searchParams.get("categoryId");
        const searchKeywords = requestUrl.searchParams.get("keywords") as string;
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: `Invalid User ID: ${userId}`}, {status: 404}
            );
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json(
                {message: `Invalid Category ID: ${categoryId}`}, {status: 404}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 404}
            );
        }
        const category = await Category.findById(categoryId);
        if(!category){
            return NextResponse.json(
                {message: "Category not found"}, {status: 404}
            );
        }
        const filter : any = {
            user: userId,
            category: categoryId
        };
        if(searchKeywords){
            filter.$or = [
                {
                    title: {$regex: searchKeywords, $options:"i"}
                },
                {
                    description: {$regex: searchKeywords, $options:"i"}
                }
            ]
        }
        const blogs = await Blog.find(filter);
        if(!blogs){
            return NextResponse.json(
                {message: "Blogs not found for the current user"}, {status: 404}
            );
        }

        return NextResponse.json(
            {message: "Successfully fetched blogs for current user", blogs}, {status: 200}
        );

    } catch (err: any) {
        return NextResponse.json(
            {error: `Error fetching blogs for the current user: ${err.message}`}, {status: 500}
        );
    }
}

export const POST = async (request: Request) => {
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        const categoryId = requestUrl.searchParams.get("categoryId");
        const body = await request.json();
        const {title, description} = body;
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: `Invalid User ID: ${userId}`}, {status: 404}
            );
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json(
                {message: `Invalid Category ID: ${categoryId}`}, {status: 404}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 404}
            );
        }
        const category = await Category.findById(categoryId);
        if(!category){
            return NextResponse.json(
                {message: "Category not found"}, {status: 404}
            );
        }
        const blog = new Blog(
            {
                title, description, user: new Types.ObjectId(userId), category: new Types.ObjectId(categoryId)
            }
        );
        await blog.save();
        return NextResponse.json(
            {message: "New blog created", blog}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: "Error Creating new blog " + err.message}, {status: 500}
        );
    }
}