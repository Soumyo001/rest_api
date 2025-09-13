import connect from "@/lib/db";
import Blog from "@/lib/models/blogs";
import Category from "@/lib/models/categories";
import User from "@/lib/models/user";
import { request } from "http";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (request: Request, context: {params: any}) => {
    const {blog: blogId} = await context.params;
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        const categoryId = requestUrl.searchParams.get("categoryId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid User ID"}, {status: 404}
            );
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json(
                {message: "Invalid Category ID"}, {status: 404}
            );
        }
        if(!blogId || !Types.ObjectId.isValid(blogId)){
            return NextResponse.json(
                {message: "Invalid Blog ID"}, {status: 404}
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
        const blog = await Blog.findOne({
            _id: blogId,
            user: userId,
            category: categoryId
        });
        if(!blog){
            return NextResponse.json(
                {message: "Blog not found", blog: []}, {status: 404}
            );
        }
        return NextResponse.json(
            {blog: blog.toObject()}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: "Error fetching single blog " + err.message}, {status: 500}
        );
    }
}

export const PATCH = async (request: Request, context: {params: any}) => {
    const {blog: blogId} = await context.params;
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        const body = await request.json();
        const {title, description} = body;
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid User ID"}, {status: 404}
            );
        }
        if(!blogId || !Types.ObjectId.isValid(blogId)){
            return NextResponse.json(
                {message: "Invalid Blog ID"}, {status: 404}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 404}
            );
        }
        const blog = await Blog.findOne({_id: blogId, user: userId});
        if(!blog){
            return NextResponse.json(
                {message: "Blog not found"}, {status: 404}
            );
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {title, description},
            {new: true}
        );
        return NextResponse.json(
            {message: "Updated Blog", blog: updatedBlog.toObject()}, {status: 200}
        );

    } catch (err: any) {
        return NextResponse.json(
            {error: `Error updating Blog ${err.message}`}, {status: 500}
        );
    }
}

export const DELETE = async (request: Request, context: {params: any}) => {
    const {blog: blogId} = await context.params;
    console.log((await context.params));
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid User ID"}, {status: 404}
            );
        }
        if(!blogId || !Types.ObjectId.isValid(blogId)){
            return NextResponse.json(
                {message: "Invalid Blog ID"}, {status: 404}
            );
        }
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 404}
            );
        }
        const blog = await Blog.findOne({_id: blogId, user: userId});
        if(!blog){
            return NextResponse.json(
                {message: "Blog not found"}, {status: 404}
            );
        }
        await Blog.findByIdAndDelete(blogId);
        return NextResponse.json(
            {message: "Deleted blog", blog: blog.toObject()}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: `Error deleting blog: ${err.message}`}, {status: 500}
        );
    }
}