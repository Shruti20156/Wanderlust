const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require('./review');
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
       url:String,
       filename:String,
    },
    price:Number,
    location:String,
    country:String,
    coordinates: {
        type: [Number],
        default: [77.321, 19.1383],
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
}, { strictPopulate: false }); 

listingSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;