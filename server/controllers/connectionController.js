const connectionService = require('../services/connectionService');

const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; 
    const receiverId = parseInt(req.body.receiverId);
    
    const connection = await connectionService.sendRequest(senderId, receiverId);

    res.json({ success: true, message: "İstek başarıyla gönderildi 📩", data: connection });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    const userId = req.user.id;

    const updatedConnection = await connectionService.acceptRequest(connectionId, userId);

    res.json({ success: true, message: "İstek kabul edildi! 🎉", data: updatedConnection });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const rejectOrRemoveRequest = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    await connectionService.rejectOrRemoveRequest(connectionId);
    res.json({ success: true, message: "Bağlantı/İstek silindi 🗑️" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = { sendRequest, acceptRequest, rejectOrRemoveRequest };