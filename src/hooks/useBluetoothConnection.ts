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
  duration: number; // duração em segundos
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
    startTime: 0, // timestamp de início do trajeto
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
        const simulatedSpeed = Math.floor(Math.random() * 99);
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

  // Receber dados do Arduino (RPM e aceleração) via HC-06
  useEffect(() => {
    if (!isConnected) return;

    // RECEPÇÃO REAL DO HC-06
    // @ts-ignore
    if (window.bluetoothSerial) {
      // @ts-ignore
      window.bluetoothSerial.subscribe('\n', (data: string) => {
        try {
          const cleanData = data.trim();
          console.log('Dados recebidos do HC-06:', cleanData);
          
          // Espera JSON no formato: {"rpm":5000,"acceleration":45}
          const parsedData = JSON.parse(cleanData);
          
          setData(prev => {
            const newRpm = parsedData.rpm || prev.rpm;
            const newAcceleration = parsedData.acceleration || prev.acceleration;
            
            // Update trip stats
            setTripStats(stats => ({
              maxSpeed: Math.max(stats.maxSpeed, prev.speed),
              speedSum: stats.speedSum + prev.speed,
              rpmSum: stats.rpmSum + newRpm,
              accelerationSum: stats.accelerationSum + newAcceleration,
              dataPoints: stats.dataPoints + 1,
              startTime: stats.startTime,
            }));
            
            return {
              ...prev,
              rpm: newRpm,
              acceleration: newAcceleration,
            };
          });
        } catch (e) {
          console.error('Erro ao fazer parse dos dados do HC-06:', e, 'Data:', data);
        }
      }, (error: any) => {
        console.error('Erro na subscription do HC-06:', error);
      });
    }
    
    // SIMULAÇÃO (apenas quando Bluetooth não estiver disponível)
    const interval = setInterval(() => {
      // @ts-ignore
      if (!window.bluetoothSerial) {
        setData(prev => {
          const newRpm = Math.floor(Math.random() * 9000);
          const newAcceleration = Math.floor(Math.random() * 100);
          
          setTripStats(stats => ({
            maxSpeed: Math.max(stats.maxSpeed, prev.speed),
            speedSum: stats.speedSum + prev.speed,
            rpmSum: stats.rpmSum + newRpm,
            accelerationSum: stats.accelerationSum + newAcceleration,
            dataPoints: stats.dataPoints + 1,
            startTime: stats.startTime,
          }));
          
          return {
            ...prev,
            rpm: newRpm,
            acceleration: newAcceleration,
          };
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // @ts-ignore
      if (window.bluetoothSerial) {
        // @ts-ignore
        window.bluetoothSerial.unsubscribe();
      }
    };
  }, [isConnected]);

  // Enviar velocidade GPS para o Arduino via HC-06
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const speedData = JSON.stringify({ speed: data.speed });
      
      // ENVIO REAL PARA HC-06
      // @ts-ignore
      if (window.bluetoothSerial) {
        // @ts-ignore
        window.bluetoothSerial.write(
          speedData + '\n',
          () => console.log('Velocidade enviada para HC-06:', speedData),
          (error: any) => console.error('Erro ao enviar velocidade para HC-06:', error)
        );
      } else {
        // SIMULAÇÃO (quando Bluetooth não estiver disponível)
        console.log('Enviando velocidade para Arduino:', speedData);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, data.speed]);

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
      // CONEXÃO COM HC-06 (Bluetooth Classic)
      // @ts-ignore - cordova-plugin-bluetooth-serial
      const bluetoothSerial = window.bluetoothSerial;
      
      if (bluetoothSerial) {
        // 1. Verificar se Bluetooth está habilitado
        const isEnabled = await new Promise((resolve) => {
          bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
        
        if (!isEnabled) {
          // Pedir para habilitar Bluetooth
          await new Promise((resolve, reject) => {
            bluetoothSerial.enable(resolve, reject);
          });
        }
        
        // 2. Listar dispositivos pareados
        const devices = await new Promise((resolve, reject) => {
          bluetoothSerial.list(resolve, reject);
        });
        
        // 3. Procurar HC-06 na lista
        // @ts-ignore
        const hc06 = devices.find((device: any) => 
          device.name.includes('HC-06') || 
          device.name.includes('HC-05') ||
          device.name.includes('HC')
        );
        
        if (!hc06) {
          throw new Error('HC-06 não encontrado. Pareie o dispositivo primeiro nas configurações do celular.');
        }
        
        // 4. Conectar ao HC-06
        await new Promise((resolve, reject) => {
          bluetoothSerial.connect(
            hc06.address,
            () => {
              console.log('Conectado ao HC-06:', hc06.name);
              resolve(true);
            },
            (error: any) => {
              console.error('Erro ao conectar:', error);
              reject(error);
            }
          );
        });
        
        console.log('HC-06 conectado com sucesso!');
      } else {
        // SIMULAÇÃO (quando plugin não estiver disponível)
        console.log('Plugin Bluetooth Serial não disponível, usando simulação');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setIsConnected(true);
      
      // Iniciar contagem de tempo do trajeto
      setTripStats(prev => ({
        ...prev,
        startTime: Date.now(),
      }));
      
      toast({
        title: "Conectado!",
        description: "HC-06 conectado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar ao HC-06",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  // Função para enviar dados para o HC-06
  const sendToArduino = useCallback(async (message: string) => {
    if (!isConnected) {
      toast({
        title: "Não conectado",
        description: "Conecte-se ao HC-06 primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      // ENVIO PARA HC-06 (Bluetooth Classic):
      /*
      // @ts-ignore
      const bluetoothSerial = window.bluetoothSerial;
      
      // Adiciona quebra de linha ao final (importante para o Arduino reconhecer)
      const dataToSend = message + '\n';
      
      await new Promise((resolve, reject) => {
        bluetoothSerial.write(
          dataToSend,
          () => {
            console.log('Enviado para HC-06:', message);
            resolve(true);
          },
          (error: any) => {
            console.error('Erro ao enviar:', error);
            reject(error);
          }
        );
      });
      
      toast({
        title: "Mensagem enviada",
        description: `Enviado: ${message}`,
      });
      */
      
      // SIMULAÇÃO
      console.log('Enviando para HC-06:', message);
      toast({
        title: "Mensagem enviada (simulação)",
        description: `Enviado: ${message}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar dados para o HC-06",
        variant: "destructive",
      });
    }
  }, [isConnected, toast]);

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
      const duration = tripStats.startTime > 0 
        ? Math.floor((Date.now() - tripStats.startTime) / 1000) 
        : 0;
      
      const newTrip: TripHistory = {
        id: Date.now().toString(),
        name: `Trajeto ${tripNumber}`,
        date: new Date().toISOString(),
        distance: data.odometer,
        avgSpeed: tripStats.speedSum / tripStats.dataPoints,
        maxSpeed: tripStats.maxSpeed,
        avgRpm: tripStats.rpmSum / tripStats.dataPoints,
        avgAcceleration: tripStats.accelerationSum / tripStats.dataPoints,
        duration: duration,
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
      startTime: Date.now(), // Reinicia contador de tempo
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
    sendToArduino,
  };
};
