import { useState } from "react";
import { Button } from "./ui/button";
import { Bluetooth, BluetoothConnected, BluetoothSearching } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BluetoothControlProps {
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
}

const BluetoothControl = ({ 
  onConnect, 
  onDisconnect, 
  isConnected, 
  isConnecting 
}: BluetoothControlProps) => {
  const { toast } = useToast();

  const handleToggle = () => {
    if (isConnected) {
      onDisconnect();
      toast({
        title: "Desconectado",
        description: "Bluetooth desconectado do Arduino",
      });
    } else {
      onConnect();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleToggle}
        variant={isConnected ? "default" : "secondary"}
        size="lg"
        className="gap-2 min-w-[200px]"
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <BluetoothSearching className="h-5 w-5 animate-pulse" />
            Conectando...
          </>
        ) : isConnected ? (
          <>
            <BluetoothConnected className="h-5 w-5" />
            Conectado
          </>
        ) : (
          <>
            <Bluetooth className="h-5 w-5" />
            Conectar Arduino
          </>
        )}
      </Button>
      
      {isConnected && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Dados em tempo real</span>
        </div>
      )}
    </div>
  );
};

export default BluetoothControl;
