// Fallback for using MaterialIcons on Android and web.

import React from 'react';
import { 
  TextT, 
  FileText, 
  ClipboardText,
  Brain,
  Lightbulb,
  Sparkle,
  ChartLineUp,
  Hourglass,
  CalendarCheck
} from 'phosphor-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type IconSymbolName = 
  | 'input-textbox'
  | 'input-form'
  | 'input-clipboard'
  | 'reflect-brain'
  | 'reflect-lightbulb'
  | 'reflect-sparkle'
  | 'timeline-chart'
  | 'timeline-hourglass'
  | 'timeline-calendar';

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export function IconSymbol({ 
  name, 
  size = 24, 
  color: colorProp,
  weight = 'regular'
}: IconSymbolProps) {
  const color = colorProp ?? useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const props = { size, color, weight };

  switch (name) {
    // Input icons
    case 'input-textbox':
      return <TextT {...props} />;
    case 'input-form':
      return <FileText {...props} />;
    case 'input-clipboard':
      return <ClipboardText {...props} />;
    
    // Reflect icons  
    case 'reflect-brain':
      return <Brain {...props} />;
    case 'reflect-lightbulb':
      return <Lightbulb {...props} />;
    case 'reflect-sparkle':
      return <Sparkle {...props} />;
    
    // Timeline icons
    case 'timeline-chart':
      return <ChartLineUp {...props} />;
    case 'timeline-hourglass':
      return <Hourglass {...props} />;
    case 'timeline-calendar':
      return <CalendarCheck {...props} />;
      
    default:
      return null;
  }
}
