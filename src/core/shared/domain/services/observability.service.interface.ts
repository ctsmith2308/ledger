interface IObservabilityService {
  recordHandlerFailure(handlerName: string, error: unknown): void;
}

export { type IObservabilityService };
