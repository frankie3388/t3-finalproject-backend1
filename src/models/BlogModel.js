const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
	blogid: {
		type: Number,
		required: true,
		unique: true
    },
	date: {
		type: String,
		required: true,
		unique: false
	},
    title: {
		type: String,
		required: true,
		unique: false
	},
    locationname: {
		type: String,
		required: true,
		unique: false
	},
	locationaddress: {
		type: String,
		required: true,
		unique: false
	},
	locationcity: {
		type: String,
		required: true,
		unique: false
	},
	locationcountry: {
		type: String,
		required: true,
		unique: false
	},
	body: {
		type: String,
		required: true,
		unique: false
	},
	tags: {
		type: String,
		required: true,
		unique: false
	},
	imagedata: {
		type: String,
		required: true,
		unique: false
	},
	userid: {
		type: String,
		required: true,
		unique: false,
		isforeignkey: true
	},
	like: {
		type: Number,
		required: true,
		unique: false
	}
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = {
	Blog
}