require('dotenv').config();

const mongoose = require('mongoose');
const { databaseConnect } = require('./database');

databaseConnect().then(async () => {

    console.log("Creating seed data!");

    // const Blog = mongoose.model('Blog', {
    // blogid: Number,
	// 	title: String,
    // location: String,
	// 	body: String, 
	// 	tags: String,
	// 	favouritePlacesToChill: [String],
	// 	photos: [String] // URL to some file storage like AWS S3, Google Cloud, Azure, whatever 
	// }};

    let newBlog = new Blog({
        blogid: 1,
        title: "Welcome to Japan",
        location: "http://googlemaps.com",
		body: "This blog post is about Japan", 
		tags: ["Japan", "Tokyo", "Osaka", "Hokkaido", "Okinawa"],
		favouritePlacesToChill: ["Shinjuku", "Shibuya"],
		photos: ["https://travellingdiarybucket.s3.ap-southeast-2.amazonaws.com/japanimage.jpg"],
    })

    await newBlog.save().then(() => {
		console.log(`${newBlog.title} is in the DB`);
	});

}).then(async () => {
	//imaginary dbDisconnect() 
	// await dbDisconnect();
})
		
		
		
		
		