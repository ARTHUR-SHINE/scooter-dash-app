import { useEffect, useState } from "react";

interface GaugeCircularProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  unit: string;
  size?: number;
  dangerThreshold?: number;
}

const GaugeCircular = ({ 
  value, 
  max, 
  min = 0, 
  label, 
  unit,
  size = 200,
  dangerThreshold
}: GaugeCircularProps) => {
  const [displayValue, setDisplayValue] = useState(min);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min(100, Math.max(0, ((displayValue - min) / (max - min)) * 100));
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = circumference * 0.125;
  const progressLength = (percentage / 100) * arcLength;
  const strokeDashoffset = -offset;
  
  const isDanger = dangerThreshold !== undefined && displayValue > dangerThreshold;
  const gradientId = isDanger ? 'gaugeGradientDanger' : 'gaugeGradient';
  const glowColor = isDanger ? 'var(--gauge-glow-danger)' : 'var(--gauge-glow)';
  
  // Calculate danger zone arc (red zone from dangerThreshold to max)
  const dangerZonePercentage = dangerThreshold !== undefined 
    ? ((dangerThreshold - min) / (max - min)) * 100 
    : 0;
  const dangerZoneLength = ((100 - dangerZonePercentage) / 100) * arcLength;
  const dangerZoneOffset = -offset - ((dangerZonePercentage / 100) * arcLength);

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
            style={{ transform: `rotate(135deg)`, transformOrigin: 'center' }}
          />
          
          {/* Danger zone arc (fixed red zone) */}
          {dangerThreshold !== undefined && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--gauge-danger) / 0.3)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dangerZoneLength} ${circumference}`}
              strokeDashoffset={dangerZoneOffset}
              strokeLinecap="round"
              style={{ 
                transform: `rotate(135deg)`, 
                transformOrigin: 'center'
              }}
            />
          )}
          
          {/* Progress arc with glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transform: `rotate(135deg)`, 
              transformOrigin: 'center',
              transition: 'stroke-dasharray 0.5s ease-out, stroke 0.3s ease-out',
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
          
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
            <linearGradient id="gaugeGradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--gauge-danger))" />
              <stop offset="100%" stopColor="hsl(var(--gauge-danger-glow))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="text-5xl font-bold tabular-nums tracking-tight transition-colors"
            style={{ color: isDanger ? 'hsl(var(--gauge-danger))' : 'hsl(var(--foreground))' }}
          >
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
