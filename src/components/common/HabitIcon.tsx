import React from 'react';
import {
  Flame,
  Dumbbell,
  BookOpen,
  GlassWater,
  Heart,
  Moon,
  Smile,
  Zap,
  Coffee,
  Code,
  Footprints,
  Sparkles,
  Apple,
  Bed,
  Sun,
  CheckCircle,
  HelpCircle,
  LucideProps,
  // Salud & Ejercicio
  HeartPulse,
  Bike,
  Activity,
  PersonStanding,
  Weight,
  MountainSnow,
  // Mente & Bienestar
  Brain,
  Wind,
  Music,
  Headphones,
  NotebookPen,
  Feather,
  // Nutrición
  Salad,
  Carrot,
  Utensils,
  // Productividad
  Briefcase,
  Laptop,
  GraduationCap,
  Target,
  ListChecks,
  Lightbulb,
  // Finanzas & Vida
  PiggyBank,
  Wallet,
  Leaf,
  Sprout,
  Dog,
  Home,
  Sunrise,
  Users,
  Tag,
  // Evitar
  Cigarette,
  Wine,
  Smartphone,
  Gamepad2,
  Tv,
  Ban,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Flame,
  Dumbbell,
  BookOpen,
  GlassWater,
  Heart,
  Moon,
  Smile,
  Zap,
  Coffee,
  Code,
  Footprints,
  Sparkles,
  Apple,
  Bed,
  Sun,
  CheckCircle,
  Clock,
  // Salud & Ejercicio
  HeartPulse,
  Bike,
  Activity,
  PersonStanding,
  Weight,
  MountainSnow,
  // Mente & Bienestar
  Brain,
  Wind,
  Music,
  Headphones,
  NotebookPen,
  Feather,
  // Nutrición
  Salad,
  Carrot,
  Utensils,
  // Productividad
  Briefcase,
  Laptop,
  GraduationCap,
  Target,
  ListChecks,
  Lightbulb,
  // Finanzas & Vida
  PiggyBank,
  Wallet,
  Leaf,
  Sprout,
  Dog,
  Home,
  Sunrise,
  Users,
  Tag,
  // Evitar
  Cigarette,
  Wine,
  Smartphone,
  Gamepad2,
  Tv,
  Ban,
  ShieldCheck,
};

interface HabitIconProps extends LucideProps {
  name: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, ...props }) => {
  const Component = ICON_MAP[name] || Flame || HelpCircle;
  return <Component {...props} />;
};
