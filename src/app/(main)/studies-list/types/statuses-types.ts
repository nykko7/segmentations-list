import { CircleAlert, CircleHelp, CircleX } from "lucide-react";

export const statusesTypes = [
  {
    value: "400",
    label: "Pendiente",
    icon: CircleHelp,
    variant: "outline" as const,
    color: "default" as const,
  },
  {
    value: "null",
    label: "Pendiente",
    icon: CircleX,
    variant: "outline" as const,
    color: "default" as const,
  },
  {
    value: "200",
    label: "Revisar",
    icon: CircleAlert,
    variant: "outline" as const,
    color: "warning" as const,
  },
  // Add other statuses as needed
];
