const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; 
    const receiverId = parseInt(req.body.receiverId);
    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: "Kendinize istek atamazsınız!" });
    }

    const existingConnection = await prisma.connection.findFirst({
      where: { senderId, receiverId }
    });

    if (existingConnection) {
      return res.status(400).json({ success: false, message: "Zaten bir istek gönderdiniz veya bağlantınız var." });
    }

    const connection = await prisma.connection.create({
      data: { senderId, receiverId, status: "PENDING" }
    });

    res.json({ success: true, message: "İstek başarıyla gönderildi 📩", data: connection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    const userId = req.user.id;

    const connection = await prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection || connection.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Bu isteği kabul etme yetkiniz yok." });
    }

    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: "ACCEPTED" }
    });

    res.json({ success: true, message: "İstek kabul edildi! 🎉", data: updatedConnection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectOrRemoveRequest = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    await prisma.connection.delete({ where: { id: connectionId } });
    res.json({ success: true, message: "Bağlantı/İstek silindi 🗑️" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendRequest, acceptRequest, rejectOrRemoveRequest };