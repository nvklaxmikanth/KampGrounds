const Campground = require('../models/campground');
const mbxGeocoding =  require('@mapbox/mapbox-sdk/services/geocoding');
const {cloudinary} = require('../cloudinary');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async(req,res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req,res) =>{
    res.render('campgrounds/new');
}
 
module.exports.createCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path,filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success','Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params; 
    const campground = await Campground.findById(id); 
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.myCampgrounds = async(req,res) => {
    id = req.user._id.toString();
    const campgrounds = await Campground.find({author:req.user});
    console.log(campgrounds);
    res.render('campgrounds/my',{campgrounds});
}

module.exports.searchCampgrounds = async(req,res) =>{
    const campgrounds = await Campground.find(req.body); 
    res.render('campgrounds/results',{campgrounds});
}

module.exports.updateCampground = async(req,res) =>{
    const {id} = req.params; 
    const campground = await Campground.findByIdAndUpdate(id,{... req.body.campground});
    const imgs = req.files.map(f => ({url: f.path,filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success','Successfully Updated campground');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted campground');
    res.redirect('/campgrounds');
}
