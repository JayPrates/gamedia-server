const router = require("express").Router();
const Post = require("../models/Post.model");
const fileUpload = require("../config/cloudinary");
const User = require("../models/User.model");

router.get("/games/:gameId", async (req, res) => {
	//  try/catch allows the user to know the server crashes - otherwise they won't know what happens
	try {
		const posts = await Post.find();
		res.status(200).json(posts);
	} catch (e) {
		res.status(500).json({ message: e });
	}
});

//In React, there should be a corresponding form to send this information
router.post("/games/:gameId", async (req, res) => {
	const { title, author,likes, description, gameTag, gameName, userImage, mediaUrl, likedBy } =
		req.body;


	//If none of these fields are then return an error message (bad request)
	if (!title || !description) {
		res.status(400).json({ message: "missing fields" });
		return;
	}

	try {
		const thisUsa = await User.find(req.session.currentUser);
		console.log(thisUsa);
		const response = await Post.create({
			title,
			author: thisUsa[0].username,
			description,
			gameName,
			gameTag,
			likes,
			likedBy: [],
			mediaUrl,
			userImg: thisUsa[0].userImg,
			// userImage,
		});
		res.status(200).json(response);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/* router.delete("/posts/:id", async (req, res) => {
	try {
		await Post.findByIdAndRemove(req.params.id);
		res.status(200).json({
			message: `Post with id ${req.params.id} was deleted.`,
		});
	} catch (e) {
		res.status(500).json({ message: e });
	}
}); */

router.get("/post/:id", async (req, res) => {
	try {
		const response = await Post.findById(req.params.id);
		res.status(200).json(response);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

router.post("/upload", fileUpload.single("file"), (req, res) => {
	try {
		res.status(200).json({ fileUrl: req.file.path });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

router.put("/post/:id", async (req, res) => {
	const { postId } = req.body;

	console.log(postId);

	const thisUsa = await User.find(req.session.currentUser);
	const thisPost = await Post.findById(req.params.id);


		try{
			if(thisPost.likedBy.includes(thisUsa[0].username)) {
				const updatePost = await Post.findByIdAndUpdate(req.params.id, {
					likes: thisPost.likes - 1,
					likedBy: thisPost.likedBy.filter(e => e !== thisUsa[0].username)
				}, {new: true});
				res.status(200).json(updatePost);
			} else {
				const updatePost = await Post.findByIdAndUpdate(req.params.id, {
					likes: thisPost.likes + 1,
					likedBy: [thisUsa[0].username, ...thisPost.likedBy],
				}, {new: true});
				res.status(200).json(updatePost);
			}
		} catch (e) {
			res.status(500).json({message: e.message});
		}
	})



//use PUT to change the entire component
//use PATCH to change one part

module.exports = router;
