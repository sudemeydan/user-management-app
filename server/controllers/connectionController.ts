import { Request, Response, NextFunction } from 'express';
import connectionService from '../services/connectionService';

const sendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const senderId = req.user?.id as string | number; 
    const receiverId = parseInt(req.body.receiverId);
    
    const connection = await connectionService.sendRequest(senderId, receiverId);

    res.json({ success: true, message: "İstek başarıyla gönderildi", data: connection });
  } catch (error) {
    next(error);
  }
};

const acceptRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const connectionId = parseInt(req.params.id);
    const userId = req.user?.id as string | number;

    const updatedConnection = await connectionService.acceptRequest(connectionId, userId);

    res.json({ success: true, message: "İstek kabul edildi!", data: updatedConnection });
  } catch (error) {
    next(error);
  }
};

const rejectOrRemoveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const connectionId = parseInt(req.params.id);
    await connectionService.rejectOrRemoveRequest(connectionId);
    res.json({ success: true, message: "Bağlantı silindi" });
  } catch (error) {
    next(error);
  }
};

export default { sendRequest, acceptRequest, rejectOrRemoveRequest };
