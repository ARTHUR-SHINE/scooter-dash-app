import { Card } from "@/components/ui/card";
import { TripHistory } from "@/hooks/useBluetoothConnection";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface TripComparisonProps {
  trips: TripHistory[];
}

export const TripComparison = ({ trips }: TripComparisonProps) => {
  // Prepare data for charts
  const distanceData = trips.map((trip) => ({
    name: trip.name,
    distance: parseFloat(trip.distance.toFixed(2)),
  }));

  const speedData = trips.map((trip) => ({
    name: trip.name,
    avgSpeed: Math.round(trip.avgSpeed),
    maxSpeed: Math.round(trip.maxSpeed),
  }));

  const rpmData = trips.map((trip) => ({
    name: trip.name,
    avgRpm: Math.round(trip.avgRpm),
  }));

  const chartConfig = {
    distance: {
      label: "Distância (km)",
      color: "hsl(var(--primary))",
    },
    avgSpeed: {
      label: "Vel. Média (km/h)",
      color: "hsl(var(--chart-1))",
    },
    maxSpeed: {
      label: "Vel. Máxima (km/h)",
      color: "hsl(var(--chart-2))",
    },
    avgRpm: {
      label: "RPM Média",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comparação de Viagens</h2>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Distance Chart */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Distância Percorrida</h3>
          <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="distance" fill="var(--color-distance)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Speed Chart */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Velocidade</h3>
          <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgSpeed" fill="var(--color-avgSpeed)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="maxSpeed" fill="var(--color-maxSpeed)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* RPM Chart */}
        <Card className="p-4 md:p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">RPM Média</h3>
          <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rpmData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgRpm" fill="var(--color-avgRpm)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>
    </div>
  );
};
