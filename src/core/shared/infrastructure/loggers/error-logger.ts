const internalLogger = (error: unknown, traceId: string): void => {
  const type = error instanceof Error ? error.constructor.name : 'UnknownError';
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[LOG] [ID: ${traceId}] Type: ${type} | Msg: ${message}`);
};

export { internalLogger };
