const { ErrorConstants } = require('../constants/error.constant');
const { deviceService } = require('../services/device.service');

const deviceController = {
  getAll: async (req, res) => {
    const pageSize = req.query.pageSize || 10;
    const page = req.query.page || 1;
    const dateSearch = req.query.date;

    // Sửa sortBy nếu client gửi 'device'
    let sortBy = req.query.sortBy ?? 'device_name';
    if (sortBy === 'device') sortBy = 'device_name';

    const sortOrder = req.query.sortOrder ?? 'ASC';

    try {
      const devices = await deviceService.getAll(
        pageSize,
        page,
        dateSearch,
        sortBy,
        sortOrder
      );
      res.status(200).json({ devices });
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu device:", error);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  getStatus: async (req, res) => {
    const status = await deviceService.getStatus();
    return res
      .status(200)
      .json({ light: status[0], fan: status[1], airConditioner: status[2] });
  },

  toggle: async (req, res) => {
    const light = req.body.light;
    const fan = req.body.fan;
    const airConditioner = req.body.airConditioner;
    const devices = [];

    if (light !== undefined)
      devices.push({ device: 'light', state: light });

    if (fan !== undefined)
      devices.push({ device: 'fan', state: fan });

    if (airConditioner !== undefined)
      devices.push({ device: 'air-conditioner', state: airConditioner });

    const error = await deviceService.toggle(devices);

    if (!error)
      return res.status(ErrorConstants.SUCCESSFUL.statusCode).json({
        message: ErrorConstants.SUCCESSFUL.message,
      });

    return res.status(error.statusCode).json({ message: error.message });
  },
};

module.exports = { deviceController };
