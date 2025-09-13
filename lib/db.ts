import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default async function connect () {
    const connectionState = mongoose.connection.readyState;

    switch (connectionState) {
        case 1:
            console.log("Already connected...");
            break;
        case 2:
            console.log("connecting...");
            break;
        default:
            try{
                mongoose.connect(MONGODB_URI!, {
                    dbName: "next15restapi",
                    bufferCommands: true
                });
            }catch(err: any){
                console.log("ERROR: ", err);
                throw new Error("ERROR: ", err);
            }
            break;
    }
}