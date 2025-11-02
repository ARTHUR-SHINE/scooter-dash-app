import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TripHistory } from "@/hooks/useBluetoothConnection";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportTripsToCSV(trips: TripHistory[]) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const headers = ["Nome", "Data", "Duração", "Distância (km)", "Velocidade Média (km/h)", "Velocidade Máxima (km/h)", "RPM Média", "Aceleração Média"];
  const rows = trips.map(trip => [
    trip.name,
    new Date(trip.date).toLocaleString('pt-BR'),
    formatDuration(trip.duration || 0),
    trip.distance.toFixed(2),
    trip.avgSpeed.toFixed(2),
    trip.maxSpeed.toFixed(2),
    trip.avgRpm.toFixed(0),
    trip.avgAcceleration.toFixed(2)
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map(row => row.join(";"))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `historico-viagens-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
