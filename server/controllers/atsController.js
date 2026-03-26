const atsService = require('../services/atsService');

const optimizeCVFormat = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;
    const result = await atsService.optimizeCVFormat(userId, cvId);
    res.json({ success: true, message: "CV başarıyla ATS formatına dönüştürüldü!", data: result });
  } catch (error) {
    next(error);
  }
};

const getATSStatus = async (req, res, next) => {
  try {
    const { cvId } = req.params;
    const status = await atsService.getUserATSStatus(cvId);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  optimizeCVFormat,
  getATSStatus
};
