import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SensorData, DeviceData, UserProfile } from '../types';

interface DataContextType {
  sensorData: SensorData[];
  deviceData: DeviceData[];
  currentSensorData: SensorData;
  devices: {
    light: boolean;
    fan: boolean;
    aircon: boolean;
  };
  userProfile: UserProfile;
  toggleDevice: (device: string) => void;
  deleteSensorData: (id: string) => void;
  deleteDeviceData: (id: string) => void;
  searchSensorData: (criteria: Partial<SensorData>) => SensorData[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [devices, setDevices] = useState({
    light: false,
    fan: false,
    aircon: false
  });

  const userProfile: UserProfile = {
    name: 'Lê Hoàng Anh',
    studentId: 'B21DCPT044',
    className: 'D21PTDPT',
    github: 'https://github.com/username',
    pdf: 'https://example.com/document.pdf',
    apiDocs: 'https://example.com/api-docs',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  };

  const currentSensorData = sensorData[0] || {
    id: '0',
    temperature: 0,
    humidity: 0,
    light: 0,
    timestamp: new Date().toLocaleString()
  };

  // ✅ Fetch dữ liệu từ backend khi app khởi động
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [sensorRes, deviceRes] = await Promise.all([
          fetch('http://localhost:3000/sensor'),
          fetch('http://localhost:3000/device')
        ]);

        const sensorJson = await sensorRes.json();
        const deviceJson = await deviceRes.json();

        if (sensorJson?.sensors) setSensorData(sensorJson.sensors);
        if (deviceJson?.devices) {
          setDeviceData(deviceJson.devices);

          // Cập nhật trạng thái thiết bị hiện tại
          const stateMap = {
            light: false,
            fan: false,
            aircon: false
          };

          deviceJson.devices.forEach((d: DeviceData) => {
            if (d.name === 'light') stateMap.light = d.status;
            if (d.name === 'fan') stateMap.fan = d.status;
            if (d.name === 'air-conditioner') stateMap.aircon = d.status;
          });

          setDevices(stateMap);
        }
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu từ backend:', error);
      }
    };

    fetchInitialData();
  }, []);

  // ✅ Gửi toggle thiết bị (POST /device/toggle)
  const toggleDevice = async (device: string) => {
    if (!(device in devices)) return;

    const newState = !devices[device as keyof typeof devices];
    setDevices(prev => ({ ...prev, [device]: newState }));

    try {
      await fetch('http://localhost:3000/device/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [device]: newState })
      });
    } catch (error) {
      console.error('❌ Lỗi gửi toggle thiết bị:', error);
    }
  };

  const deleteSensorData = (id: string) => {
    setSensorData(prev => prev.filter(item => item.id !== id));
  };

  const deleteDeviceData = (id: string) => {
    setDeviceData(prev => prev.filter(item => item.id !== id));
  };

  const searchSensorData = (criteria: Partial<SensorData>) => {
    return sensorData.filter(data => {
      if (criteria.temperature !== undefined && data.temperature !== criteria.temperature) return false;
      if (criteria.humidity !== undefined && data.humidity !== criteria.humidity) return false;
      if (criteria.light !== undefined && data.light !== criteria.light) return false;
      return true;
    });
  };

  return (
    <DataContext.Provider value={{
      sensorData,
      deviceData,
      currentSensorData,
      devices,
      userProfile,
      toggleDevice,
      deleteSensorData,
      deleteDeviceData,
      searchSensorData
    }}>
      {children}
    </DataContext.Provider>
  );
};
