import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

export interface ScooterData {
  rpm: number;
  acceleration: number;
  speed: number;
}

export const useBluetoothConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [data, setData] = useState<ScooterData>({
    rpm: 0,
    acceleration: 0,
    speed: 0,
  });
  const { toast } = useToast();

  // Simular recebimento de dados para demonstração
  // Em produção, isso seria substituído pela comunicação Bluetooth real
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setData({
        rpm: Math.floor(Math.random() * 9999),
        acceleration: Math.floor(Math.random() * 100),
        speed: Math.floor(Math.random() * 72),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

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
    setData({
      rpm: 0,
      acceleration: 0,
      speed: 0,
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
