import React, { useState } from 'react';
import DataTable from '../components/tables/DataTable';
import { useData } from '../context/DataContext';
import { DeviceData } from '../types';
import { format, parseISO } from 'date-fns';

const DeviceHistoryPage: React.FC = () => {
  const { deviceData, deleteDeviceData } = useData();
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [filteredData, setFilteredData] = useState<DeviceData[]>(deviceData);

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    
    let sorted = [...deviceData];
    if (e.target.value === 'timestamp') {
      sorted = sorted.sort((a, b) => 
        parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
      );
    }
    
    setFilteredData(sorted);
  };

  const handleDeleteSelected = () => {
    // This would actually require a confirmation in a real app
    filteredData.forEach(item => {
      deleteDeviceData(item.id);
    });
    setFilteredData([]);
  };

  // Update filtered data when deviceData changes
  React.useEffect(() => {
    let sorted = [...deviceData];
    if (sortBy === 'timestamp') {
      sorted = sorted.sort((a, b) => 
        parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
      );
    }
    setFilteredData(sorted);
  }, [deviceData, sortBy]);

  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof DeviceData,
    },
    {
      header: 'Tên thiết bị',
      accessor: 'name' as keyof DeviceData,
    },
    {
      header: 'Trạng thái',
      accessor: 'status' as keyof DeviceData,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'BẬT' : 'TẮT'}
        </span>
      )
    },
    {
      header: 'Thời gian',
      accessor: 'timestamp' as keyof DeviceData,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lịch sử bật/tắt thiết bị</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="sortBy" className="text-gray-700">Sắp xếp theo:</label>
          <select
            id="sortBy"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={sortBy}
            onChange={handleSort}
          >
            <option value="timestamp">Thời gian</option>
          </select>
        </div>
        
        <button
          onClick={handleDeleteSelected}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Xóa dữ liệu
        </button>
      </div>
      
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        onDelete={deleteDeviceData}
      />
    </div>
  );
};

export default DeviceHistoryPage;