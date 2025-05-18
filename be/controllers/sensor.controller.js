const { sensorService } = require('../services/sensor.service');

const sensorController = {
  getAll: async (req, res) => {
    const pageSize = req.query.pageSize || 10;
    const page = req.query.page || 1;

    // Xử lý sortBy = time → timestamp
    let sortBy = req.query.sortBy || 'timestamp';
    if (sortBy === 'time') sortBy = 'timestamp';

    const sortOrder = req.query.sortOrder || 'DESC';

    // Xử lý filterBy = time → timestamp
    let filterBy = req.query.filterBy;
    if (filterBy === 'time') filterBy = 'timestamp';

    const filterValue = req.query.filterValue;

    try {
      const sensors = await sensorService.getAll(
        pageSize,
        page,
        filterBy,
        filterValue,
        sortBy,
        sortOrder
      );
      res.status(200).json({ sensors });
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu sensor:", error);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },
};

module.exports = { sensorController };
