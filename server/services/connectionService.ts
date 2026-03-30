import connectionRepository from '../repositories/connectionRepository';
import AppError from '../utils/AppError';

const sendRequest = async (senderId: number | string, receiverId: number | string) => {
  if (Number(senderId) === Number(receiverId)) {
    throw new AppError("Kendinize istek atamazsınız!", 400);
  }

  const existingConnection = await connectionRepository.findConnection(senderId, receiverId);

  if (existingConnection) {
    throw new AppError("Zaten bir istek gönderdiniz veya bağlantınız var.", 400);
  }

  return await connectionRepository.createConnection(senderId, receiverId);
};

const acceptRequest = async (connectionId: number | string, userId: number | string) => {
  const connection: any = await connectionRepository.findConnectionById(connectionId);

  if (!connection || connection.receiverId !== Number(userId)) {
    throw new AppError("Bu isteği kabul etme yetkiniz yok.", 403);
  }

  return await connectionRepository.updateConnectionStatus(connectionId, "ACCEPTED");
};

const rejectOrRemoveRequest = async (connectionId: number | string) => {
  return await connectionRepository.deleteConnection(connectionId);
};

export default {
  sendRequest,
  acceptRequest,
  rejectOrRemoveRequest
};
