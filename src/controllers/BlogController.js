const express = require('express');
const { Blog } = require('../models/BlogModel');
const router = express.Router();
const { authenticateJWT } = require('../middleware/AuthMiddleware');
const { User } = require('../models/UserModel');
const multer  = require('multer')
const crypto = require('crypto');
const sharp = require('sharp');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion= process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
})

// This creates a random image name so that image files do not get over written in S3
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// Find All blogs in the DB
router.get("/all", authenticateJWT, async (request, response) => {
    // Check if authentication was successful
    if (request.user && request.user.message === "Authentication successful") {
        // Empty object in .find() means get ALL documents
        const results = await Blog.find({}).populate('user');

        // Iterate through each post and retrieve signed URLs for all images
        for (const result of results) {
            const imageUrls = [];

            // Iterate through each image in the imagedata array
            for (const imageName of result.imagedata) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: imageName,
                };
                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                imageUrls.push(url);
            }

            // Assign the array of image URLs to the post
            result.imageUrls = imageUrls;
        }
        response.json({
            Blog: results
        });
    } else {
        response.status(403).json({ message: "Forbidden: Authentication failed" });
    }
});

// Find one blog by its ID
router.get("/:id", authenticateJWT, async (request, response) => {
    try {
        const blogId = request.params.id;
  
        const result = await Blog.findById(blogId).populate('user');

        if (!result) {
                return response.status(404).json({ error: 'Blog not found' });
        }

        const imageUrls = [];

        for (const imageName of result.imagedata) {
            
            // Iterate through each image in the imagedata array
            const getObjectParams = {
                Bucket: bucketName,
                Key: imageName,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            imageUrls.push(url);
        }

        // Assign the array of image URLs to the post
        result.imageUrls = imageUrls;
  
        // Update the database with the new array of signed URLs
        await result.save();
  
        response.json({
            Blog: result
        });
    } catch (error) {
        console.error("Error fetching blog by ID:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Find all blogs by username
router.get("/multiple/username", authenticateJWT, async (request, response) => {
    try {
        const blogUsername = request.query.q;
        const user_id = await User.find({username: blogUsername})
        const results = await Blog.find({ user: user_id }).populate('user');

        //   generate signedUrl so that the client can use the imageUrl to fetch the image from Amazon s3 bucket
        //   generate signedUrl so that the client can use the imageUrl to fetch the image from Amazon s3 bucket
        for (const result of results) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: result.imagedata
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, {expiresIn: 3600})
            result.imageUrl = url
        }

        if (!results || results.length === 0) {
            return response.status(404).json({ error: 'Blogs not found' });
        }
        console.log("Query result:", results);
        response.json({
            data: results
        });
    } catch (error) {
        console.error("Error fetching blogs by username:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Find blog by its location 
router.get("/multiple/location", authenticateJWT, async (request, response) => {
    try {
        const locationToFilterBy = request.query.locationToFilterBy;

        // Use a regular expression to perform a case-insensitive search on multiple fields
        const results = await Blog.find({
            $or: [
                { locationname: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationaddress: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationcity: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
                { locationcountry: { $regex: `^${locationToFilterBy}$`, $options: 'i' } },
            ],
        }).populate('user');

                console.log("Query result:", results);

        //   generate signedUrl so that the client can use the imageUrl to fetch the image from Amazon s3 bucket
        for (const result of results) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: result.imagedata
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, {expiresIn: 3600})
            result.imageUrl = url
        }

        if (results.length > 0) {
            response.json({
                data: results,
            });
        } else {
            console.log("No blogs exist with the location specified " + locationToFilterBy);
            response.status(404).json({ error: `No blogs found with the location: ${locationToFilterBy}` });
        }

    } catch (error) {
        console.error("Error fetching blogs:", error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new blog in the DB
// POST localhost:3000/blog/
router.post("/image", authenticateJWT, upload.array('images', 8), async (request, response) => {
	try{
        
        console.log(request.user)
        const user = await User.findOne({ _id: request.user.userId });

        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        console.log("request.body", request.body)
        console.log("request.file", request.file)

        // Create an array to store image names
        const imageNames = [];

        // Process each uploaded image
        for (const file of request.files) {
            // Resize image
            const buffer = await sharp(file.buffer).resize({
                height: 1920,
                width: 1080,
                fit: "cover"
            }).toBuffer();

            // Generate a random image name
            const imageName = randomImageName();
            const params = {
                Bucket: bucketName,
                Key: imageName,
                Body: buffer,
                ContentType: file.mimetype,
            };

            // Upload the image to S3
            const command = new PutObjectCommand(params);
            await s3.send(command);

            // Add the image name to the array
            imageNames.push(imageName);
        }

        // Create a new blog entry in the database
        const result = await Blog.create({
            title: request.body.title,
            locationname: request.body.locationname,
            locationaddress: request.body.locationaddress,
            locationcity: request.body.locationcity,
            locationcountry: request.body.locationcountry,
            body: request.body.body,
            tags: request.body.tags,
            imagedata: imageNames, // Store the image name in the database
            user: user, 
        });

	    response.json({
	    	Blog: result
	    });
    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});


// Update an existing blog in the DB.
// Find one blog by its ID, and modify that blog. 
// Patch is for whatever properties are provided,
// does not overwrite or remove any unmentioned properties of the blog
router.patch("/image/:id", authenticateJWT, upload.array('images', 8), async (request, response) => {
    try {
        const blogId = request.params.id;
        console.log(blogId);

        const result = await Blog.findById({ _id: blogId }).populate('user');
        console.log(result);

        if (!result) {
            return response.status(404).json({ error: 'Blog not found' });
        }

        console.log(request.user.userId)
        // Find the user from jwt token and use this to see if user is admin
        const checkIsAdminUser = await User.findOne({ _id: request.user.userId});

        console.log(result.user._id)

        // Create an array to store image names
        // const imageNames = [];

        // Check if the logged in user is the user that created the blog or if they are admin
        if (result.user._id.toString() === request.user.userId || checkIsAdminUser.isAdmin) {

            // Create an array to store image names
            const imageNames = [];

            // Update the blog properties
            result.title = request.body.title || result.title;
            result.locationname = request.body.locationname || result.locationname;
            result.locationaddress = request.body.locationaddress || result.locationaddress;
            result.locationcity = request.body.locationcity || result.locationcity;
            result.locationcountry = request.body.locationcountry || result.locationcountry;
            result.body = request.body.body || result.body;
            result.imagedata = result.imagedata || imageNames;

            // Check if a new image is provided
            if (request.files && request.files.length > 0) {
                // Process each uploaded image
                for (const file of request.files) {
                    // Resize image
                    const buffer = await sharp(file.buffer).resize({
                        height: 1920,
                        width: 1080,
                        fit: "cover"
                    }).toBuffer();
                
                    // Generate a random image name
                    const imageName = randomImageName();
                    const params = {
                        Bucket: bucketName,
                        Key: imageName,
                        Body: buffer,
                        ContentType: file.mimetype,
                    };
                
                    // Upload the image to S3
                    const command = new PutObjectCommand(params);
                    await s3.send(command);
                
                    // Add the image name to the array
                    imageNames.push(imageName);
                }

                // Update the blog's imagedata with the new array of image names
                result.imagedata = imageNames;
            }

            // Save the updated blog
            await result.save();

            response.json({
                Blog: result
            });
        } else {
            const errorMessage = "You are not authorized to edit this blog";
            response.status(403).json({
                Blog: errorMessage
            });
        }
    } catch (error) {
        console.error("Error updating blog by ID:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


// Find one blog by its ID,
// and delete it from the DB.
router.delete("/delete/:id", authenticateJWT, async (request, response) => {
	try {
        const blogId = request.params.id;
        console.log(blogId);

        const result = await Blog.findOne({ _id: blogId }).populate('user');
        console.log(result);

        if (!result) {
            return response.status(404).json({ error: 'Blog not found' });
        }

        // Find the user from jwt token and use this to see if user is admin
        const checkIsAdminUser = await User.findOne({ _id: request.user.userId});

        console.log(request.user.userId)
        // Check if the logged in user is the user that created the blog or if user is Admin
        if (result.user._id.toString() === request.user.userId || checkIsAdminUser.isAdmin) {

            // Delete picture in S3 bucket
            const params = {
                Bucket: bucketName,
                Key: result.imagedata,
            };
            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        
            // Delete blog
            const deletedBlog = await Blog.deleteOne({ _id: blogId })

            response.json({
                Blog: deletedBlog
            });
        } else {
            const errorMessage = "You are not authorized to delete this blog";
            response.status(403).json({
                Blog: errorMessage
            });
        }
    } catch (error) {
        console.error("Error deleting blog by ID:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;