const Comment = require("../models/Comment");
const Post = require("../models/Post");

const createComment = async (req, res, next) => {
    try {
        const { desc, slug, parent, replyOnUser } = req.body;

        const post = await Post.findOne({ slug: slug });

        if (!post) {
            const error = new Error("Post was not found");
            next(error);
            return;
        }

        const newComment = new Comment({
            user: req.user._id,
            desc,
            post: post._id,
            parent,
            replyOnUser,
        });

        const savedComment = await newComment.save();
        res.json(savedComment);
    } catch (error) {
        next(error);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const { desc } = req.body;

        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            const error = new Error("Comment was not found");
            next(error);
            return;
        }

        comment.desc = desc || comment.desc;

        const updatedComment = await comment.save();
        res.json(updatedComment);
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.commentId);
        await Comment.deleteMany({ parent: comment._id });

        if (!comment) {
            const error = new Error("Comment was not found");
            next(error);
            return;
        }

        res.json({
            message: "Comment deleted",
        });
    } catch (error) {
        next(error);
    }
};

const getAllComments = async (req, res, next) => {
	try {
		const filter = req.query.searchKeyword;
		let where = {};
		if (filter) {
			where.desc = { $regex: filter, $options: "i" };
		}
		let query = Comment.find(where);
		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * pageSize;
		const total = await Comment.find(where).countDocuments();
		const pages = Math.ceil(total / pageSize);

		res.header({
			"x-filter": filter,
			"x-totalcount": JSON.stringify(total),
			"x-currentpage": JSON.stringify(page),
			"x-pagesize": JSON.stringify(pageSize),
			"x-totalpagecount": JSON.stringify(pages),
		});

		if (page > pages) {
			return res.json([]);
		}

		const result = await query
			.skip(skip)
			.limit(pageSize)
			.populate([
				{
					path: "user",
					select: ["avatar", "name", "verified"],
				},
				{
					path: "parent",
					populate: [
						{
							path: "user",
							select: ["avatar", "name"],
						},
					],
				},
				{
					path: "replyOnUser",
					select: ["avatar", "name"],
				},
				{
					path: "post",
					select: ["slug", "title"],
				},
			])
			.sort({ updatedAt: "desc" });

		return res.json(result);
	} catch (error) {
		next(error);
	}
};

module.exports = { createComment, updateComment, deleteComment, getAllComments };
