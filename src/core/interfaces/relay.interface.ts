export class RelayInterface {
  readonly flowKey!: string;

  readonly payload!: Record<string, unknown>;
}

export class RelayResultInterface {
  readonly nextFlowKeys!: Array<{
    nextFlowKey?: string;
    as?: string;
    isAsync: boolean;
  }>;

  readonly terminate!: boolean;

  readonly isAsync!: boolean;
}
