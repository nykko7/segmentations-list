import { Separator } from "@/components/ui/separator";

interface PageTitleProps {
  title?: string;
  description?: string;
  withSeparator?: boolean;
  rightComponent?: React.ReactNode;
}

export const PageHeader = ({
  title = "Título de la página",
  description,
  withSeparator,
  rightComponent,
}: PageTitleProps) => {
  return (
    <>
      <div className="my-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {rightComponent && rightComponent}
      </div>
      {withSeparator && <Separator className="mb-6" />}
    </>
  );
};
