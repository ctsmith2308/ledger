type CodeBlock = {
  label: string;
  code: string;
};

type ArchitectureDecision = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  context: string;
  decision: string;
  rationale: string[];
  tradeoffs: { pro: string; con: string }[];
  codeBlocks: CodeBlock[];
};

export { type CodeBlock, type ArchitectureDecision };
