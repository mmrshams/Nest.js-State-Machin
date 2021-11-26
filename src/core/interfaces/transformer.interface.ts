export class TransformerMessage {
  readonly flowKey!: string;

  readonly payload!: Record<string, unknown>;
}

export class TemplateInterface {
  readonly payload!: Record<string, unknown>;
}
