import connect from "@/lib/db";
import Category from "@/lib/models/categories";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";


export const PATCH = async (request: Request, context: {params: Promise<{category: string}>}) => {
    const {category: categoryId} = await context.params;

    try {
        const body = await request.json();
        const title = body.title;
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid user id"}, {status: 404}
            );
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json(
                {message: "Invalid category id"}, {status: 404}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found."}, {status: 404}
            );
        }
        const category = await Category.findOne({_id: categoryId, user: userId});
        if(!category){
            return NextResponse.json(
                {message: `category for the user id : ${userId} not found`}, {status: 404}
            );
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            {title},
            {new: true}
        ).lean();
        return NextResponse.json(
            {message: `Updated category for user: ${userId}`, updated_category: updatedCategory}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: `Error updating categories : ${err.message}`}, {status: 500}
        );
    }
}

export const DELETE = async ( request: Request, context: {params: Promise<{category: string}>}) => {
    const {category: categoryId} = await context.params;
    try {
        const requestUrl = new URL(request.url);
        const userId = requestUrl.searchParams.get("userId");
        if(!userId || !Types.ObjectId.isValid(userId)){
            return NextResponse.json(
                {message: "Invalid User ID"}, {status: 404}
            );
        }
        if(!categoryId || !Types.ObjectId.isValid(categoryId)){
            return NextResponse.json(
                {message: "Invalid category ID"}, {status: 404}
            );
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return NextResponse.json(
                {message: "User not found"}, {status: 200}
            );
        }
        const category = await Category.findOne({_id: categoryId, user: userId});
        if(!category){
            return NextResponse.json(
                {message: `Category not found for user id: ${userId}`}, {status: 404}
            );
        }
        await Category.findByIdAndDelete(categoryId);
        return NextResponse.json(
            {message: `Successfully deleted category for user ${userId}`, deleted_category: category.toObject()}, {status: 200}
        );
    } catch (err: any) {
        return NextResponse.json(
            {error: `Error deleting category : ${err.message}`}, {status: 500}
        );
    }
}