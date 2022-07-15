const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
 
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",() =>{
    console.log("Database Connected");
});
const sample = a => a[Math.floor(Math.random()*a.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: '61a5f7acdb9a863a8e62255b',
            geometry: {
                type: 'Point', 
                coordinates: [
                    cities[random].longitude,
                    cities[random].latitude
                ] 
            },
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/nvklaxmikanth/image/upload/v1638615595/YelpCamp/wcxtqfmmudohvjdim9pf.jpg',
                  filename: 'YelpCamp/wcxtqfmmudohvjdim9pf',
                },
                {
                  url: 'https://res.cloudinary.com/nvklaxmikanth/image/upload/v1638615617/YelpCamp/xb3xssfzkwsd2quexiqd.jpg',
                  filename: 'YelpCamp/xb3xssfzkwsd2quexiqd',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus praesentium, earum aperiam dolor exercitationem sapiente porro nam odit expedita illo corrupti dolorum. Doloremque quaerat inventore quidem ab officiis ipsum quibusdam!',
            price
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    db.close();
})