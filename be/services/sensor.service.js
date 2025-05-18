const { mqttHandler, MqttTopicEnum } = require('../config/mqtt');
const { ErrorConstants } = require('../constants/error.constant');
const { sensorModel } = require('../models/sensor.model');

const sensorService = {
  getAll: async (pageSize, page, filterBy, filterValue, sortBy, sortOrder) => {
    if (filterBy == 'time' && filterValue) {
      const date = new Date(filterValue);
      if (isNaN(date.getTime())) {
        return ErrorConstants.BAD_REQUEST.errorCode;
      }
      const utcDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      filterValue = utcDate.toISOString().slice(0, 19).replace('T', ' ');
    }

    return await sensorModel.getAll(
      pageSize,
      page,
      filterBy,
      filterValue,
      sortBy,
      sortOrder
    );
  },
};

module.exports = { sensorService };
