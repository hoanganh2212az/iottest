export interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  light: number;
  timestamp: string;
}

export interface DeviceData {
  id: string;
  name: string;
  status: boolean;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  studentId: string;
  className: string;
  github: string;
  pdf: string;
  apiDocs: string;
  avatarUrl: string;
}

export type DeviceType = 'light' | 'fan' | 'aircon';