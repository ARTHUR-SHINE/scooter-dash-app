import { useState } from "react";
import { useBluetoothConnection } from "@/hooks/useBluetoothConnection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TripCard } from "@/components/TripCard";
import { TripComparison } from "@/components/TripComparison";
import { exportTripsToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const navigate = useNavigate();
  const { tripHistory, deleteTrip } = useBluetoothConnection();
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const toggleTripSelection = (tripId: string) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const selectedTripData = tripHistory.filter(trip => selectedTrips.includes(trip.id));

  const handleExport = () => {
    if (tripHistory.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há viagens registradas no histórico.",
        variant: "destructive"
      });
      return;
    }
    
    const tripsToExport = selectedTrips.length > 0 ? selectedTripData : tripHistory;
    exportTripsToCSV(tripsToExport);
    
    toast({
      title: "Exportação concluída",
      description: `${tripsToExport.length} viagem(ns) exportada(s) com sucesso.`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            {tripHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar {selectedTrips.length > 0 ? `(${selectedTrips.length})` : "Tudo"}
              </Button>
            )}
            
            {selectedTrips.length >= 2 && (
              <Button
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {showComparison ? "Esconder" : "Comparar"} ({selectedTrips.length})
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Histórico de Viagens
        </h1>

        {/* Comparison View */}
        {showComparison && selectedTrips.length >= 2 && (
          <TripComparison trips={selectedTripData} />
        )}

        {/* Trip List */}
        {tripHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma viagem registrada ainda. Quando você resetar o hodômetro, a viagem será salva automaticamente.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tripHistory.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={selectedTrips.includes(trip.id)}
                onToggleSelect={toggleTripSelection}
                onDelete={deleteTrip}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
