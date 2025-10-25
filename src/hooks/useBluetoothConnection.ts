import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

export interface ScooterData {
  rpm: number;
  acceleration: number;
  speed: number;
  odometer: number;
}

export interface TripHistory {
  id: string;
  name: string;
  date: string;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  avgRpm: number;
  avgAcceleration: number;
}

export const useBluetoothConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [data, setData] = useState<ScooterData>(() => {
    const savedOdometer = localStorage.getItem('scooter_odometer');
    return {
      rpm: 0,
      acceleration: 0,
      speed: 0,
      odometer: savedOdometer ? parseFloat(savedOdometer) : 0,
    };
  });
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>(() => {
    const saved = localStorage.getItem('trip_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Track stats for current trip
  const [tripStats, setTripStats] = useState({
    maxSpeed: 0,
    speedSum: 0,
    rpmSum: 0,
    accelerationSum: 0,
    dataPoints: 0,
  });
  
  const { toast } = useToast();

  // Salvar hodômetro no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('scooter_odometer', data.odometer.toString());
  }, [data.odometer]);

  // GPS para velocidade e hodômetro
  useEffect(() => {
    if (!isConnected) return;

    let watchId: number;
    let gpsAvailable = false;
    let lastGPSUpdate = Date.now();

    const startGPS = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            gpsAvailable = true;
            lastGPSUpdate = Date.now();
            
            const speed = position.coords.speed 
              ? Math.round(position.coords.speed * 3.6) // m/s para km/h
              : 0;

            // Calcular distância para hodômetro
            if (lastPosition && position.coords.speed && position.coords.speed > 0) {
              const distance = calculateDistance(
                lastPosition.coords.latitude,
                lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
              );
              
              setData(prev => ({
                ...prev,
                speed,
                odometer: prev.odometer + distance
              }));
            } else {
              setData(prev => ({ ...prev, speed }));
            }

            setLastPosition(position);
          },
          (error) => {
            console.log('GPS não disponível, usando simulação');
            gpsAvailable = false;
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
          }
        );
      }
    };

    // Fallback: Se GPS não estiver disponível ou sem movimento, simular velocidade
    const simulationInterval = setInterval(() => {
      const timeSinceLastGPS = Date.now() - lastGPSUpdate;
      
      // Se GPS não está disponível ou sem atualização por 3 segundos, simular
      if (!gpsAvailable || timeSinceLastGPS > 3000) {
        const simulatedSpeed = Math.floor(Math.random() * 72);
        const simulatedDistance = (simulatedSpeed / 3600); // km percorridos em 1 segundo
        
        setData(prev => ({
          ...prev,
          speed: simulatedSpeed,
          odometer: prev.odometer + simulatedDistance
        }));
      }
    }, 1000);

    startGPS();
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearInterval(simulationInterval);
    };
  }, [isConnected, lastPosition, toast]);

  // Simular recebimento de dados do Arduino para RPM e aceleração
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setData(prev => {
        const newRpm = Math.floor(Math.random() * 9000);
        const newAcceleration = Math.floor(Math.random() * 100);
        
        // Update trip stats
        setTripStats(stats => ({
          maxSpeed: Math.max(stats.maxSpeed, prev.speed),
          speedSum: stats.speedSum + prev.speed,
          rpmSum: stats.rpmSum + newRpm,
          accelerationSum: stats.accelerationSum + newAcceleration,
          dataPoints: stats.dataPoints + 1,
        }));
        
        return {
          ...prev,
          rpm: newRpm,
          acceleration: newAcceleration,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Função para calcular distância entre dois pontos (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // IMPLEMENTAÇÃO REAL COM BLUETOOTH:
      // Descomentar este código quando testar com Arduino real
      
      /*
      import { BleClient } from '@capacitor-community/bluetooth-le';
      
      // 1. Inicializar BLE
      await BleClient.initialize();
      
      // 2. Pedir permissões (Android)
      await BleClient.requestDevice({
        // Filtrar apenas dispositivos com nome específico do Arduino
        namePrefix: 'Arduino',
        // Ou usar UUID do serviço específico
        // services: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      });
      
      // 3. Conectar ao dispositivo
      const device = await BleClient.requestDevice();
      await BleClient.connect(device.deviceId, (deviceId) => {
        console.log('Desconectado do dispositivo:', deviceId);
        setIsConnected(false);
      });
      
      // 4. Descobrir serviços (UUID do serviço BLE do Arduino)
      const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
      const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
      
      // 5. Ler dados continuamente (notificações)
      await BleClient.startNotifications(
        device.deviceId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (value) => {
          // value é um DataView com os bytes recebidos
          
          // OPÇÃO 1: Se Arduino enviar JSON string
          const decoder = new TextDecoder('utf-8');
          const jsonString = decoder.decode(value);
          
          try {
            const parsedData = JSON.parse(jsonString);
            // parsedData = {"rpm": 3500, "speed": 45, "acceleration": 78}
            
            setData(prev => ({
              ...prev,
              rpm: parsedData.rpm || 0,
              acceleration: parsedData.acceleration || 0,
              // speed continua vindo do GPS
            }));
          } catch (e) {
            console.error('Erro ao fazer parse do JSON:', e);
          }
          
          // OPÇÃO 2: Se Arduino enviar bytes separados por vírgula "3500,45,78"
          // const text = decoder.decode(value);
          // const values = text.split(',');
          // setData(prev => ({
          //   ...prev,
          //   rpm: parseInt(values[0]) || 0,
          //   acceleration: parseInt(values[2]) || 0,
          // }));
          
          // OPÇÃO 3: Se Arduino enviar bytes binários
          // const rpm = value.getUint16(0, true); // 2 bytes para RPM
          // const acceleration = value.getUint8(2); // 1 byte para aceleração
          // setData(prev => ({
          //   ...prev,
          //   rpm,
          //   acceleration,
          // }));
        }
      );
      */
      
      // SIMULAÇÃO (remover quando usar Bluetooth real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast({
        title: "Conectado!",
        description: "Arduino conectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Arduino",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setLastPosition(null);
    setData(prev => ({
      rpm: 0,
      acceleration: 0,
      speed: 0,
      odometer: prev.odometer, // Mantém o valor do hodômetro
    }));
  }, []);

  const resetOdometer = useCallback(() => {
    // Save current trip to history before resetting
    if (data.odometer > 0 && tripStats.dataPoints > 0) {
      const tripNumber = tripHistory.length + 1;
      const newTrip: TripHistory = {
        id: Date.now().toString(),
        name: `Trajeto ${tripNumber}`,
        date: new Date().toISOString(),
        distance: data.odometer,
        avgSpeed: tripStats.speedSum / tripStats.dataPoints,
        maxSpeed: tripStats.maxSpeed,
        avgRpm: tripStats.rpmSum / tripStats.dataPoints,
        avgAcceleration: tripStats.accelerationSum / tripStats.dataPoints,
      };
      
      const updatedHistory = [newTrip, ...tripHistory];
      setTripHistory(updatedHistory);
      localStorage.setItem('trip_history', JSON.stringify(updatedHistory));
      
      toast({
        title: "Viagem salva!",
        description: `${data.odometer.toFixed(2)} km registrados no histórico`,
      });
    }
    
    // Reset odometer and trip stats
    setData(prev => ({
      ...prev,
      odometer: 0,
    }));
    setTripStats({
      maxSpeed: 0,
      speedSum: 0,
      rpmSum: 0,
      accelerationSum: 0,
      dataPoints: 0,
    });
    localStorage.setItem('scooter_odometer', '0');
  }, [data.odometer, tripStats, tripHistory, toast]);

  const deleteTrip = useCallback((tripId: string) => {
    const updatedHistory = tripHistory.filter(trip => trip.id !== tripId);
    setTripHistory(updatedHistory);
    localStorage.setItem('trip_history', JSON.stringify(updatedHistory));
    toast({
      title: "Viagem removida",
      description: "O registro foi excluído do histórico",
    });
  }, [tripHistory, toast]);

  return {
    isConnected,
    isConnecting,
    data,
    tripHistory,
    connect,
    disconnect,
    resetOdometer,
    deleteTrip,
  };
};
