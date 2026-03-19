const internalLogger = (error: unknown, traceId?: string): void => {
  // for other logging services/tools like Pinto.
  console.error({ traceId, error });
};

export { internalLogger };
