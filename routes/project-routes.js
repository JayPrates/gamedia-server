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

	const { title, author, likes, description, gameTag, gameName, userImage, mediaUrl, likedBy } =
		req.body;


	//If none of these fields are then return an error message (bad request)
	if (!title || !description) {
		res.status(400).json({ message: "missing fields" });
		return;
	}

	try {
		const thisUsa = await User.findById(req.session.currentUser._id);
		console.log(thisUsa);
		const response = await Post.create({
			title,
			author: thisUsa.username,
			description,
			gameName,
			gameTag,
			likes,
			likedBy: [],
			mediaUrl,
			userImg: thisUsa.userImg,
			favoriteGames: [],
			comments: [],
			// userImage,
		});
		res.status(200).json(response);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});


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

	const thisUsa = await User.findById(req.session.currentUser._id);
	const thisPost = await Post.findById(req.params.id);
	console.log(thisUsa);


	try {
		if (thisPost.likedBy.includes(thisUsa.username)) {
			const updatePost = await Post.findByIdAndUpdate(req.params.id, {
				likes: thisPost.likes - 1,
				likedBy: thisPost.likedBy.filter(e => e !== thisUsa.username)
			}, { new: true });
			res.status(200).json(updatePost);
		} else {
			const updatePost = await Post.findByIdAndUpdate(req.params.id, {
				likes: thisPost.likes + 1,
				likedBy: [thisUsa.username, ...thisPost.likedBy],
			}, { new: true });
			res.status(200).json(updatePost);
		}
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});


//ROUTE FOR FAVORITE GAMES
router.put("/favorite", async (req, res) => {
	const { favoriteGames } = req.body;

	const thisUsa = await User.findById(req.session.currentUser._id);
	console.log(thisUsa);


	try {
		if (thisUsa.favoriteGames.includes(favoriteGames)) {
			return;
		} else {
			const updateFavorites = await User.findByIdAndUpdate(thisUsa._id, {
				favoriteGames: [favoriteGames, ...thisUsa.favoriteGames],
			})
			res.status(200).json(updateFavorites);
		}
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

router.put("/comments/:id", async (req, res) => {
	const {comments} = req.body;
	const thisPost = await Post.findById(req.params.id);
	const thisUsa = await User.findById(req.session.currentUser._id);
	console.log(comments)

	try {
		const postCommented = await Post.findByIdAndUpdate(req.params.id, {
			comments: [{thisComment: comments, theUser:  thisUsa.username, theUserImg: thisUsa.userImg}, ...thisPost.comments],
		});
		res.status(200).json(postCommented);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

router.get("/profile", async (req, res) => {

	try {

		const user = await User.findById(req.session.currentUser._id);

		res.status(200).json(user);

	} catch (e) {

		res.status(500).json({ message: e.message });

	}

});

router.put("/profile", fileUpload.single("file"), async (req, res) => {

	const { userImg } = req.body;

	try {

		const updateUserImg = await User.findByIdAndUpdate(

			req.session.currentUser._id,

			{

				userImg: userImg,

			},

			{ new: true }

		);

		console.log(updateUserImg);

		res.status(200).json(updateUserImg);

	} catch (e) {

		res.status(500).json({ message: e.message });

	}

});



//use PUT to change the entire component
//use PATCH to change one part

module.exports = router;
