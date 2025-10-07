import { useState } from "react";
import GaugeCircular from "@/components/GaugeCircular";
import BluetoothControl from "@/components/BluetoothControl";
import { useBluetoothConnection } from "@/hooks/useBluetoothConnection";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { isConnected, isConnecting, data, connect, disconnect } = useBluetoothConnection();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Scooter Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitoramento em Tempo Real via Bluetooth
          </p>
        </header>

        {/* Bluetooth Control */}
        <div className="flex justify-center">
          <BluetoothControl
            onConnect={connect}
            onDisconnect={disconnect}
            isConnected={isConnected}
            isConnecting={isConnecting}
          />
        </div>

        {/* Gauges Grid */}
        <Card className="p-8 bg-card border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex justify-center">
              <GaugeCircular
                value={data.speed}
                max={72}
                label="Velocidade"
                unit="km/h"
                size={220}
              />
            </div>
            
            <div className="flex justify-center">
              <GaugeCircular
                value={data.rpm}
                max={9999}
                label="RPM"
                unit="rpm"
                size={220}
              />
            </div>
            
            <div className="flex justify-center">
              <GaugeCircular
                value={data.acceleration}
                max={100}
                label="Aceleração"
                unit="%"
                size={220}
              />
            </div>
          </div>
        </Card>

        {/* Info Card */}
        {!isConnected && (
          <Card className="p-6 bg-secondary/50 border-border">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">Como usar</h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Conectar Arduino" para iniciar a conexão Bluetooth com sua Scooter.
                Os dados serão atualizados em tempo real assim que conectado.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
