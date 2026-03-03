const postService = require('../services/postService');
const driveClient = require('../utils/driveClient');

const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    const files = req.files || [];

    const newPost = await postService.createPostWithImages(userId, content, files);
    res.status(201).json({ success: true, message: "Gönderi paylaşıldı!", data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const posts = await postService.getAllPosts(currentUserId);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    await postService.deletePost(postId, userId, userRole);
    res.json({ success: true, message: "Gönderi başarıyla silindi!" });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const getImage = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) return res.status(400).send("No file ID provided");
    await driveClient.streamFile(fileId, res);
  } catch (error) {
    if (!res.headersSent) res.status(500).send("Görsel yüklenemedi");
  }
};

module.exports = {
  createPost,
  getAllPosts,
  deletePost,
  getImage
};