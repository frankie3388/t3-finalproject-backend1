const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
	blogid: {
		type: Number,
		required: true,
		unique: true
    },
    title: {
		type: String,
		required: true,
		unique: false
	},
    location: {
		type: String,
		required: true,
		unique: false
	},
	body: {
		type: String,
		required: true,
		unique: false
	},
	favouritePlacesToChill: {
		type: [String],
		required: false,
		unique: false
	},
	tags: {
		type: String,
		required: true,
		unique: false
	},
	photos: {
		type: String,
		required: true,
		unique: false
	}
	
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = {
	Blog
}