const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');

const postSchema = new Schema({
	title: String,
	author: String,
	description: String,
	gameTag: String,
	userImage: String,
	mediaUrl: String,
	gameName: String,
	likes: Number,
	likedBy: Array,
	mediaUrl: String,
},
{
	timestamps:true,
});

const Post = model("Post", postSchema);

module.exports = Post;
