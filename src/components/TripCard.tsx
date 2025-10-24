import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Gauge, Zap } from "lucide-react";
import { TripHistory } from "@/hooks/useBluetoothConnection";
import { Checkbox } from "@/components/ui/checkbox";

interface TripCardProps {
  trip: TripHistory;
  isSelected: boolean;
  onToggleSelect: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}

export const TripCard = ({ trip, isSelected, onToggleSelect, onDelete }: TripCardProps) => {
  const date = new Date(trip.date);
  const formattedDate = date.toLocaleDateString('pt-BR');
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className={`p-6 space-y-4 transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(trip.id)}
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold">{trip.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <div className="text-xs">
                <span>{formattedDate}</span>
                <span className="mx-1">•</span>
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(trip.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Distância</p>
          <p className="text-2xl font-bold">{trip.distance.toFixed(2)} km</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Gauge className="h-3 w-3" /> Vel. Máxima
          </p>
          <p className="text-2xl font-bold">{Math.round(trip.maxSpeed)} km/h</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Gauge className="h-3 w-3" /> Vel. Média
          </p>
          <p className="text-xl font-semibold">{Math.round(trip.avgSpeed)} km/h</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" /> RPM Média
          </p>
          <p className="text-xl font-semibold">{Math.round(trip.avgRpm)}</p>
        </div>
        
        <div className="space-y-1 col-span-2">
          <p className="text-sm text-muted-foreground">Aceleração Média</p>
          <p className="text-xl font-semibold">{Math.round(trip.avgAcceleration)}%</p>
        </div>
      </div>
    </Card>
  );
};
