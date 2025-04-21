import {
  CircleCheck,
  CircleDashed,
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDot,
  CircleHelp,
} from "lucide-react";

export const statusesTypes = [
  {
    value: "created",
    label: "Creado",
    icon: CircleDot,
    variant: "outline" as const,
    color: "default" as const,
  },
  {
    value: "processing",
    label: "Procesando",
    icon: CircleDashed,
    variant: "outline" as const,
    color: "default" as const,
  },
  {
    value: "partially_processed",
    label: "Parcialmente procesado",
    icon: Clock,
    variant: "outline" as const,
    color: "warning" as const,
  },
  {
    value: "failed",
    label: "Fallido",
    icon: AlertCircle,
    variant: "outline" as const,
    color: "destructive" as const,
  },
  {
    value: "error",
    label: "Error",
    icon: AlertCircle,
    variant: "outline" as const,
    color: "destructive" as const,
  },
  {
    value: "fully_processed",
    label: "Completamente procesado",
    icon: CheckCircle2,
    variant: "outline" as const,
    color: "default" as const,
  },
  {
    value: "reviewed",
    label: "Revisado",
    icon: CircleCheck,
    variant: "outline" as const,
    color: "success" as const,
  },
  {
    value: "not_reviewed",
    label: "Sin revisar",
    icon: CircleHelp,
    variant: "outline" as const,
    color: "warning" as const,
  },
];
