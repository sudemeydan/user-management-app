const postService = require('../services/postService');

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
    const posts = await postService.getAllPosts();
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

module.exports = {
  createPost,
  getAllPosts,
  deletePost
};