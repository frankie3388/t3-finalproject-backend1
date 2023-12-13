const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	commentid: {
		type: Number,
		required: true,
		unique: true
    },
	date: {
		type: Date,
		required: true,
		unique: false
	},
    commentbody: {
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
	blogid: {
		type: Number,
		required: true,
		unique: false,
        isforeignkey: true
	},
	
	
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
	Comment
}