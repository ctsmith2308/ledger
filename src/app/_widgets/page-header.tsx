function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  );
}

export { PageHeader };
