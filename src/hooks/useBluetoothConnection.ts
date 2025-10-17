import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

export interface ScooterData {
  rpm: number;
  acceleration: number;
  speed: number;
  odometer: number;
}

export const useBluetoothConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [data, setData] = useState<ScooterData>({
    rpm: 0,
    acceleration: 0,
    speed: 0,
    odometer: 0,
  });
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();

  // GPS para velocidade e hodômetro
  useEffect(() => {
    if (!isConnected) return;

    let watchId: number;

    const startGPS = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
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
            console.error('GPS error:', error);
            toast({
              title: "Erro no GPS",
              description: "Não foi possível obter localização",
              variant: "destructive",
            });
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
          }
        );
      }
    };

    startGPS();
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isConnected, lastPosition, toast]);

  // Simular recebimento de dados do Arduino para RPM e aceleração
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        rpm: Math.floor(Math.random() * 9000), // Limitado a 9000
        acceleration: Math.floor(Math.random() * 100),
      }));
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
      // Aqui seria implementada a lógica real de conexão Bluetooth
      // usando @capacitor-community/bluetooth-le
      
      // Simulação de delay de conexão
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
    setData({
      rpm: 0,
      acceleration: 0,
      speed: 0,
      odometer: 0,
    });
  }, []);

  return {
    isConnected,
    isConnecting,
    data,
    connect,
    disconnect,
  };
};
