import React from 'react';
import { 
  CircleCheck, 
  Calendar, 
  Undo2, 
  Target, 
  Medal, 
  Sunrise, 
  TrendingUp, 
  Flame 
} from 'lucide-react';

interface BadgeIconProps {
  iconName: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ iconName, size = 20, className = '', strokeWidth = 2 }) => {
  const props = { size, className, strokeWidth };
  
  switch (iconName) {
    case 'CircleCheck': return <CircleCheck {...props} />;
    case 'Calendar': return <Calendar {...props} />;
    case 'Undo2': return <Undo2 {...props} />;
    case 'Target': return <Target {...props} />;
    case 'Medal': return <Medal {...props} />;
    case 'Sunrise': return <Sunrise {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'Flame': return <Flame {...props} />;
    // Fallback if needed
    default: return <CircleCheck {...props} />;
  }
};
