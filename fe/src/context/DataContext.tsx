import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SensorData, DeviceData, UserProfile } from '../types';
import MQTTService from '../services/mqttService';

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
  const [devices, setDevices] = useState(() => {
    // Initialize with saved states from localStorage
    return MQTTService.getInstance().getInitialDeviceStates();
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

  useEffect(() => {
    const mqttService = MQTTService.getInstance();

    mqttService.onSensorData((data) => {
      setSensorData(prev => [data, ...prev]);
    });

    mqttService.onDeviceData((data) => {
      setDeviceData(prev => [data, ...prev]);
      const deviceKey = data.name === 'Đèn' ? 'light' : 
                       data.name === 'Quạt' ? 'fan' : 
                       data.name === 'Điều hòa' ? 'aircon' : null;
      if (deviceKey) {
        setDevices(prev => ({ ...prev, [deviceKey]: data.status }));
      }
    });

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const toggleDevice = (device: string) => {
    if (device in devices) {
      const newStatus = !devices[device as keyof typeof devices];
      setDevices(prev => ({ ...prev, [device]: newStatus }));
      MQTTService.getInstance().publishDeviceControl(device, newStatus);
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
      if (criteria.temperature !== undefined && 
          data.temperature !== criteria.temperature) {
        return false;
      }
      if (criteria.humidity !== undefined && 
          data.humidity !== criteria.humidity) {
        return false;
      }
      if (criteria.light !== undefined && 
          data.light !== criteria.light) {
        return false;
      }
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