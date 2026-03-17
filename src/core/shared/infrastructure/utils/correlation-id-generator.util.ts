import { v4 as uuidv4 } from 'uuid';

const resolveTraceId = (correlationID?: string | null): string => {
  return correlationID ?? uuidv4();
};

export { resolveTraceId };
