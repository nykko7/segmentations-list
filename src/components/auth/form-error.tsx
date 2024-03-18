import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-x-4 rounded-md bg-destructive/75 p-3 text-sm text-destructive-foreground">
      <ExclamationTriangleIcon className="h-8 w-8" />
      <span>{message}</span>
    </div>
  );
};
