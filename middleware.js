const Listing=require("./models/listing");
module.exports.isOwner=async(req,res,next)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser(id))){
    req.flash("error","you don't have access to edit");
    res.redirect(`/listings/${id}`);
  }
}