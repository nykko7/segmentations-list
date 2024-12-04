import { CircleHelp, CircleX } from "lucide-react";

export const statusesTypes = [
  {
    value: "400",
    label: "Error",
    icon: CircleX,
    variant: "destructive" as const,
  },
  {
    value: "null",
    label: "Pendiente",
    icon: CircleHelp,
    variant: "outline" as const,
  },
  // Add other statuses as needed
];
