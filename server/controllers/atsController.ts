import { Request, Response, NextFunction } from 'express';
import atsService, { OptimizeCVResult } from '../services/atsService';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const optimizeCVFormat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cvId = parseInt(req.params.cvId as string, 10);
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized: User not found" });
      return;
    }

    const result: OptimizeCVResult = await atsService.optimizeCVFormat(userId, cvId);
    
    const response: ApiResponse<OptimizeCVResult> = {
      success: true, 
      message: "CV başarıyla ATS formatına dönüştürüldü!", 
      data: result 
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getATSStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cvId = parseInt(req.params.cvId as string, 10);
    const status = await atsService.getUserATSStatus(cvId);
    
    const response: ApiResponse<any> = { 
      success: true, 
      data: status 
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  optimizeCVFormat,
  getATSStatus
};
