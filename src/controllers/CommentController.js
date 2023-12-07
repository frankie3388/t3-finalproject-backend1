const express = require('express');
const { Comment } = require('../models/CommentModel');
const router = express.Router();

// Find All commwnts in the DB
router.get("/all", async (request, response) => {
	// Empty object in .find() means get ALL documents
	let result = await Comment.find({});

	response.json({
		Comment: result
	});

});

// Find one Comment by its ID
router.get("/one/id/:commentid", async (request, response) => {
	let result = null;

	response.json({
		Comment: result
	});

});

// Find Comment by its date 
router.get("/multiple/date/:dateToSearchFor", async (request, response) => {
	let result = null;

	response.json({
		Comment: result
	});

});




// Create a new Comment in the DB
// POST localhost:3000/comment/
router.post("/", async (request, response) => {
	let result = await Comment.create(request.body);

	response.json({
		Comment: result
	});

});

// Update an existing comment in the DB.
// Find one comment by its ID, and modify that comment. 
// Patch is for whatever properties are provided,
// does not overwrite or remove any unmentioned properties of the cat 
router.patch("/:commentid", async (request, response) => {
	let result = null;

	response.json({
		Comment: result
	});

});

// Find one comment by its ID,
// and delete it from the DB.
router.delete("/:commentid", async (request, response) => {
	let result = null;

	response.json({
		Comment: result
	});

});


module.exports = router;