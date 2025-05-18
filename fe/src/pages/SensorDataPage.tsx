import React, { useState } from 'react';
import DataTable from '../components/tables/DataTable';
import { useData } from '../context/DataContext';
import { SensorData } from '../types';
import { Search, Delete } from 'lucide-react';

const SensorDataPage: React.FC = () => {
  const { sensorData, deleteSensorData } = useData();
  const [searchTemperature, setSearchTemperature] = useState<string>('');
  const [searchHumidity, setSearchHumidity] = useState<string>('');
  const [searchLight, setSearchLight] = useState<string>('');
  const [searchTimestamp, setSearchTimestamp] = useState<string>('');
  const [filteredData, setFilteredData] = useState<SensorData[]>(sensorData);

  // Cập nhật khi sensorData thay đổi
  React.useEffect(() => {
    setFilteredData(sensorData);
  }, [sensorData]);

  const handleSearch = () => {
    let filtered = [...sensorData];

    // Nhiệt độ
    if (searchTemperature.trim()) {
      const temp = parseFloat(searchTemperature);
      if (!isNaN(temp)) {
        filtered = filtered.filter(item =>
          Math.abs(item.temperature - temp) <= 0.1
        );
      }
    }

    // Độ ẩm
    if (searchHumidity.trim()) {
      const humidity = parseFloat(searchHumidity);
      if (!isNaN(humidity)) {
        filtered = filtered.filter(item =>
          Math.abs(item.humidity - humidity) <= 0.1
        );
      }
    }

    // Ánh sáng
    if (searchLight.trim()) {
      const light = parseFloat(searchLight);
      if (!isNaN(light)) {
        filtered = filtered.filter(item =>
          Math.abs(item.light - light) <= 0.1
        );
      }
    }

    // Thời gian
    if (searchTimestamp.trim()) {
      const searchTerm = searchTimestamp.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.timestamp?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  };

  const handleDeleteAll = () => {
    filteredData.forEach(item => {
      deleteSensorData(item.id);
    });
    setFilteredData([]);
  };

  const resetFilters = () => {
    setSearchTemperature('');
    setSearchHumidity('');
    setSearchLight('');
    setSearchTimestamp('');
    setFilteredData(sensorData);
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof SensorData },
    { header: 'Nhiệt độ (°C)', accessor: 'temperature' as keyof SensorData },
    { header: 'Độ ẩm (%)', accessor: 'humidity' as keyof SensorData },
    { header: 'Ánh sáng (lux)', accessor: 'light' as keyof SensorData },
    { header: 'Thời gian', accessor: 'timestamp' as keyof SensorData },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dữ liệu cảm biến</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              Nhiệt độ (°C)
            </label>
            <input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="Nhập nhiệt độ..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTemperature}
              onChange={e => setSearchTemperature(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="humidity" className="block text-sm font-medium text-gray-700 mb-1">
              Độ ẩm (%)
            </label>
            <input
              id="humidity"
              type="number"
              step="0.1"
              placeholder="Nhập độ ẩm..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchHumidity}
              onChange={e => setSearchHumidity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="light" className="block text-sm font-medium text-gray-700 mb-1">
              Ánh sáng (lux)
            </label>
            <input
              id="light"
              type="number"
              step="0.1"
              placeholder="Nhập ánh sáng..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchLight}
              onChange={e => setSearchLight(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian
            </label>
            <input
              id="timestamp"
              type="text"
              placeholder="HH:mm:ss dd/MM/yyyy"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTimestamp}
              onChange={e => setSearchTimestamp(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
          >
            <Search size={18} className="mr-1" />
            Tìm kiếm
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Tất cả
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
          >
            <Delete size={18} className="mr-1" />
            Xóa
          </button>
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        onDelete={deleteSensorData}
      />
    </div>
  );
};

export default SensorDataPage;
