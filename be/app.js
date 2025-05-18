const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const { routes } = require('./routes/index.route');
const { database } = require('./config/database');
const MQTTService = require('./config/mqtt');

const app = express();

// Middleware
app.use(cors()); // ✅ Cho phép tất cả origin (nếu muốn cấu hình cụ thể, dùng origin: 'http://localhost:3001')
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Kết nối database rồi mới khởi động server + MQTT
database.connect().then(() => {
  routes(app); // Đăng ký router

  // ✅ Khởi động MQTT sau khi DB đã sẵn sàng
  MQTTService.getInstance();

  app.listen(3000, () => {
    console.log('✅ Server is running on http://localhost:3000');
  });
}).catch((err) => {
  console.error("❌ Không thể kết nối tới SQL Server:", err);
});
