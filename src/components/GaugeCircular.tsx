import { useEffect, useState } from "react";

interface GaugeCircularProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  unit: string;
  size?: number;
}

const GaugeCircular = ({ 
  value, 
  max, 
  min = 0, 
  label, 
  unit,
  size = 200 
}: GaugeCircularProps) => {
  const [displayValue, setDisplayValue] = useState(min);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = ((displayValue - min) / (max - min)) * 100;
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;
  const rotation = 135;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--gauge-track))"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={-circumference * 0.125}
            strokeLinecap="round"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
          />
          
          {/* Progress arc with glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.5s ease-out',
              filter: 'drop-shadow(0 0 8px hsl(var(--gauge-glow)))'
            }}
          />
          
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-foreground tabular-nums tracking-tight">
            {Math.round(displayValue)}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
            {unit}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </div>
  );
};

export default GaugeCircular;
