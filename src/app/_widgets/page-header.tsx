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
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

export { PageHeader };
