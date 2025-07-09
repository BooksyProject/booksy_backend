import Comment, { IComment } from "@/database/comment.model";
import {
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentResponseDTO,
} from "@/dtos/CommentDTO";
import { connectToDatabase } from "../mongoose";
import mongoose, { Schema } from "mongoose";
import Chapter from "@/database/chapter.model";
import User from "@/database/user.model";

export async function getAllComments() {
  try {
    connectToDatabase();
    const result: CommentResponseDTO[] = await Comment.find();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createComment(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  chapterId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      author: createBy || new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: null,
      originalCommentId: null,
      likes: [],
      createdAt: new Date(),
      createBy: createBy || new mongoose.Types.ObjectId(),
    });

    await Chapter.findByIdAndUpdate(
      chapterId,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    return newComment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createReplyCommentChapter(
  params: CreateCommentDTO,
  createBy: Schema.Types.ObjectId | undefined,
  chapterId: string
) {
  try {
    connectToDatabase();

    const newComment = await Comment.create({
      author: createBy || new mongoose.Types.ObjectId(),
      content: params.content,
      replies: params.replies || [],
      parentId: params.parentId || null,
      originalCommentId: params.originalCommentId || null,
      likes: [],
      createAt: new Date(),
      createBy: createBy || new mongoose.Types.ObjectId(),
    });

    await Chapter.findByIdAndUpdate(
      chapterId,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    return newComment;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteCommentReply(
  commentId: string,
  originalCommentId: string,
  chapterId: string
) {
  try {
    await connectToDatabase();

    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return {
        status: false,
        message: `Comment with ID ${commentId} does not exist.`,
      };
    }

    await Comment.findByIdAndDelete(commentId);

    await Chapter.findByIdAndUpdate(
      chapterId,
      { $pull: { comments: commentId } },
      { new: true }
    );

    await Comment.findByIdAndUpdate(
      originalCommentId,
      { $pull: { replies: commentId } },
      { new: true }
    );

    return {
      status: true,
      message: `Comment ${commentId} deleted from chapter and parent.`,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      message: `An error occurred: ${error.message}`,
    };
  }
}

export async function deleteComment(commentId: string, chapterId: string) {
  try {
    await connectToDatabase();

    const comment = (await Comment.findById(
      commentId
    ).lean()) as IComment | null;
    if (!comment) {
      return {
        status: false,
        message: `Comment ${commentId} not found.`,
      };
    }

    const replies = comment.replies || [];
    const idsToDelete = [commentId, ...replies];

    await Comment.deleteMany({ _id: { $in: idsToDelete } });

    await Chapter.findByIdAndUpdate(
      chapterId,
      { $pull: { comments: { $in: idsToDelete } } },
      { new: true }
    );

    return {
      status: true,
      message: `Comment ${commentId} and replies deleted from chapter.`,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      status: false,
      message: "Error deleting comment.",
    };
  }
}

export async function updateComment(
  commentId: string,
  params: UpdateCommentDTO
) {
  try {
    connectToDatabase();

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: params.content,
        replies: params.replies,
      },
      { new: true }
    );

    if (!updatedComment) {
      throw new Error(`Comment ${commentId} not found.`);
    }

    return {
      status: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addReplyToComment(commentId: string, replyId: string) {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error(`Comment ${commentId} not found.`);

    comment.replies = [...(comment.replies || []), replyId];
    await comment.save();

    return comment;
  } catch (error: any) {
    console.error("Error adding reply:", error);
    return {
      status: false,
      message: error.message,
    };
  }
}

export async function likeComment(
  commentId: string | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);

    if (!comment || !user) {
      throw new Error("Comment or user not found.");
    }

    await comment.likes.addToSet(userId);
    await comment.save();

    return { message: `Liked comment ${commentId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function dislikeComment(
  commentId: string | undefined,
  userId: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment || !user) {
      throw new Error("Comment or user not found.");
    }

    await comment.likes.pull(userId);
    await comment.save();

    return { message: `Disliked comment ${commentId}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCommentById(
  commentId: string
): Promise<CommentResponseDTO | null> {
  try {
    await connectToDatabase();

    const comment = await Comment.findById(commentId)
      .populate({ path: "author", select: "_id firstName lastName avatar" })
      .populate({
        path: "parentId",
        populate: { path: "author", select: "_id firstName lastName avatar" },
      })
      .populate({ path: "originalCommentId", select: "_id" });

    if (!comment) throw new Error("Comment not found");

    let parentAuthor = null;
    if (comment.parentId) {
      const parentComment = await Comment.findById(comment.parentId).populate({
        path: "author",
        select: "_id firstName lastName avatar",
      });

      parentAuthor = parentComment?.author
        ? {
            _id: parentComment._id.toString(),
            firstName: parentComment.author.firstName || "",
            lastName: parentComment.author.lastName || "",
            avatar: parentComment.author.avatar || "",
          }
        : {
            _id: comment.parentId.toString(),
            firstName: "",
            lastName: "",
            avatar: "",
          };
    }

    return {
      _id: String(comment._id),
      author: {
        _id: comment.author._id.toString(),
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        avatar: comment.author.avatar,
      },
      content: comment.content,
      replies:
        comment.replies?.map((id: mongoose.Types.ObjectId) => id.toString()) ||
        [],
      likes:
        comment.likes?.map((id: mongoose.Types.ObjectId) => id.toString()) ||
        [],
      createAt: comment.createAt,
      parentId: parentAuthor,
      originalCommentId: comment.originalCommentId?._id?.toString() || null,
    };
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    throw error;
  }
}

export async function getCommentsByChapterId(chapterId: string) {
  try {
    await connectToDatabase();

    const chapter = await Chapter.findById(chapterId).populate({
      path: "comments",
      populate: {
        path: "author",
        select: "_id firstName lastName avatar",
      },
    });

    if (!chapter) throw new Error("Chapter not found");

    return chapter.comments;
  } catch (error) {
    console.error("❌ getCommentsByChapterId error:", error);
    throw error;
  }
}
