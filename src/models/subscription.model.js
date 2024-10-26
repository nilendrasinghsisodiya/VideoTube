import mongoose from "mongoose"

const subscriptionSchmea = new mongoose.Schema({
subscriber:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
},
channels: {

    type: mongoose.Schema.Types.ObjectId,
    ref: "User"

}
},{timestamps:true});

export  const Subscription = mongoose.model("subscription", subscriptionSchmea);