const express = require('express');
const { Blog } = require('../models/BlogModel');
const router = express.Router();

// Find All blogs in the DB
router.get("/all", async (request, response) => {
    // Empty object in .find() means get ALL documents
    const result = await Blog.find({}).populate('user');

    response.json({
        Blog: result
    });

});

// Find one blog by its ID
router.get("/one/id/:id", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});

// Find blog by its title 
router.get("/multiple/title/:titleToSearchFor", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});

// Find blog by its location 
router.get("/multiple/location/:locationToFilterBy", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});


// Create a new blog in the DB
// POST localhost:3000/blog/
router.post("/", async (request, response) => {
	let result = await Blog.create(request.body);

	response.json({
		Blog: result
	});

});

// Update an existing blog in the DB.
// Find one blog by its ID, and modify that blog. 
// Patch is for whatever properties are provided,
// does not overwrite or remove any unmentioned properties of the cat 
router.patch("/:id", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});

// Find one blog by its ID,
// and delete it from the DB.
router.delete("/:id", async (request, response) => {
	let result = null;

	response.json({
		Blog: result
	});

});


module.exports = router;