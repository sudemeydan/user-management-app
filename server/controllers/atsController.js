const atsService = require('../services/atsService');

const optimizeCVFormat = async (req, res) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;
    const result = await atsService.optimizeCVFormat(userId, cvId);
    res.json({ success: true, message: "CV başarıyla ATS formatına dönüştürüldü!", data: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getATSStatus = async (req, res) => {
  try {
    const { cvId } = req.params;
    const status = await atsService.getUserATSStatus(cvId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  optimizeCVFormat,
  getATSStatus
};
