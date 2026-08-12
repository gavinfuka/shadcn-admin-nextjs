import { ProviderMetadata, UIMessageStreamWriter } from "ai";

export type StreamTextOptions = {
  id?: string;
  providerMetadata?: ProviderMetadata;
};

export type DataEventInput<DATA> = {
  name: keyof DATA & string;
  value: DATA[keyof DATA & string];
};

export type ToolWriterOptions<TOOLS, NAME extends keyof TOOLS & string> = {
  toolCallId?: string;
  input?: TOOLS[NAME] extends { input: infer I } ? I : unknown;
  providerMetadata?: ProviderMetadata;
  providerExecuted?: boolean;
  toolMetadata?: Record<string, unknown>;
  dynamic?: boolean;
  title?: string;
};

export type ToolHandle<OUTPUT, DATA = unknown, TOOLS = unknown> = {
  result: (output: OUTPUT) => EventWriter<DATA, TOOLS>;
  error: (errorText: string) => EventWriter<DATA, TOOLS>;
  deny: () => EventWriter<DATA, TOOLS>;
};

export type SourceUrlPayload = {
  sourceId: string;
  url: string;
  title?: string;
  providerMetadata?: ProviderMetadata;
};

export type SourceDocumentPayload = {
  sourceId: string;
  mediaType: string;
  title: string;
  filename?: string;
  providerMetadata?: ProviderMetadata;
};

export type FilePayload = {
  url: string;
  mediaType: string;
  providerMetadata?: ProviderMetadata;
};

export type ReasoningFilePayload = {
  url: string;
  mediaType: string;
  providerMetadata?: ProviderMetadata;
};

export type EventWriter<DATA = unknown, TOOLS = unknown> = {
  text(text?: string, options?: StreamTextOptions): EventWriter<DATA, TOOLS>;
  reasoning(text?: string, options?: StreamTextOptions): EventWriter<DATA, TOOLS>;
  sleep(delayMs: number): EventWriter<DATA, TOOLS>;
  data(part: DataEventInput<DATA>): EventWriter<DATA, TOOLS>;
  error(errorText?: string): EventWriter<DATA, TOOLS>;
  tool(name: string, options?: { toolCallId?: string; input?: unknown; providerMetadata?: ProviderMetadata; providerExecuted?: boolean; toolMetadata?: Record<string, unknown>; dynamic?: boolean; title?: string }): ToolHandle<unknown, DATA, TOOLS>;
  tool<NAME extends keyof TOOLS & string>(name: NAME, options?: ToolWriterOptions<TOOLS, NAME>): ToolHandle<TOOLS[NAME] extends { output: infer O } ? O : unknown, DATA, TOOLS>;
  sourceUrl(overrides?: Partial<SourceUrlPayload>): EventWriter<DATA, TOOLS>;
  sourceDocument(overrides?: Partial<SourceDocumentPayload>): EventWriter<DATA, TOOLS>;
  file(overrides?: Partial<FilePayload>): EventWriter<DATA, TOOLS>;
  reasoningFile(overrides?: Partial<ReasoningFilePayload>): EventWriter<DATA, TOOLS>;
  custom(kind?: string, providerMetadata?: ProviderMetadata): EventWriter<DATA, TOOLS>;
  start(messageId?: string, messageMetadata?: unknown): EventWriter<DATA, TOOLS>;
  finish(): EventWriter<DATA, TOOLS>;
  stepStart(): EventWriter<DATA, TOOLS>;
  finishStep(): EventWriter<DATA, TOOLS>;
  abort(reason?: string): EventWriter<DATA, TOOLS>;
};

/**
 * Fluent wrapper around UIMessageStreamWriter that implements the EventWriter interface.
 */
export class EventStreamWriter<DATA = unknown, TOOLS = unknown> implements EventWriter<DATA, TOOLS> {
  constructor(private writer: UIMessageStreamWriter) {}

  /**
   * Write a keep-alive event to prevent timeout. This is emitted as a custom
   * data part (`data-keep-alive`) because `UIMessageStreamWriter` does not
   * expose a way to send SSE comment pings directly.
   */
  writeKeepAlive() {
    this.writer.write({
      type: "data-keep-alive",
      data: "keep-alive",
    } as any);
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  text(text?: string, options?: StreamTextOptions): EventWriter<DATA, TOOLS> {
    const id = options?.id ?? this.generateId();
    this.writer.write({ type: "text-start", id, providerMetadata: options?.providerMetadata });
    if (text) {
      this.writer.write({ type: "text-delta", id, delta: text, providerMetadata: options?.providerMetadata });
    }
    this.writer.write({ type: "text-end", id, providerMetadata: options?.providerMetadata });
    return this;
  }

  reasoning(text?: string, options?: StreamTextOptions): EventWriter<DATA, TOOLS> {
    const id = options?.id ?? this.generateId();
    this.writer.write({ type: "reasoning-start", id, providerMetadata: options?.providerMetadata });
    if (text) {
      this.writer.write({ type: "reasoning-delta", id, delta: text, providerMetadata: options?.providerMetadata });
    }
    this.writer.write({ type: "reasoning-end", id, providerMetadata: options?.providerMetadata });
    return this;
  }

  sleep(delayMs: number): EventWriter<DATA, TOOLS> {
    // Intentionally synchronous: actual delays should be awaited by the caller.
    // This method preserves fluent chaining.
    return this;
  }

  data(part: DataEventInput<DATA>): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: `data-${part.name}`,
      data: part.value,
    } as any);
    return this;
  }

  error(errorText?: string): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "error", errorText: errorText ?? "An error occurred" });
    return this;
  }

  tool(name: string, options?: { toolCallId?: string; input?: unknown; providerMetadata?: ProviderMetadata; providerExecuted?: boolean; toolMetadata?: Record<string, unknown>; dynamic?: boolean; title?: string }): ToolHandle<unknown, DATA, TOOLS>;
  tool<NAME extends keyof TOOLS & string>(name: NAME, options?: ToolWriterOptions<TOOLS, NAME>): ToolHandle<TOOLS[NAME] extends { output: infer O } ? O : unknown, DATA, TOOLS>;
  tool(name: string, options?: { toolCallId?: string; input?: unknown; providerMetadata?: ProviderMetadata; providerExecuted?: boolean; toolMetadata?: Record<string, unknown>; dynamic?: boolean; title?: string }): ToolHandle<unknown, DATA, TOOLS> {
    const toolCallId = options?.toolCallId ?? this.generateId();
    const input = options?.input ?? {};
    const inputTextDelta = typeof input === "string" ? input : JSON.stringify(input);
    const baseToolOptions = {
      providerExecuted: options?.providerExecuted,
      providerMetadata: options?.providerMetadata,
      toolMetadata: options?.toolMetadata,
      dynamic: options?.dynamic,
    };
    const inputToolOptions = {
      ...baseToolOptions,
      title: options?.title,
    };

    this.writer.write({
      type: "tool-input-start",
      toolCallId,
      toolName: name,
      ...inputToolOptions,
    } as any);

    this.writer.write({
      type: "tool-input-delta",
      toolCallId,
      inputTextDelta,
    } as any);

    this.writer.write({
      type: "tool-input-available",
      toolCallId,
      toolName: name,
      input,
      ...inputToolOptions,
    } as any);

    return {
      result: (output) => {
        this.writer.write({
          type: "tool-output-available",
          toolCallId,
          output,
          ...baseToolOptions,
        } as any);
        return this;
      },
      error: (errorText) => {
        this.writer.write({
          type: "tool-output-error",
          toolCallId,
          errorText,
          ...baseToolOptions,
        } as any);
        return this;
      },
      deny: () => {
        this.writer.write({
          type: "tool-output-denied",
          toolCallId,
        });
        return this;
      },
    };
  }

  sourceUrl(overrides?: Partial<SourceUrlPayload>): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: "source-url",
      sourceId: overrides?.sourceId ?? this.generateId(),
      url: overrides?.url ?? "",
      title: overrides?.title,
      providerMetadata: overrides?.providerMetadata,
    });
    return this;
  }

  sourceDocument(overrides?: Partial<SourceDocumentPayload>): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: "source-document",
      sourceId: overrides?.sourceId ?? this.generateId(),
      mediaType: overrides?.mediaType ?? "application/octet-stream",
      title: overrides?.title ?? "Document",
      filename: overrides?.filename,
      providerMetadata: overrides?.providerMetadata,
    });
    return this;
  }

  file(overrides?: Partial<FilePayload>): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: "file",
      url: overrides?.url ?? "",
      mediaType: overrides?.mediaType ?? "application/octet-stream",
      providerMetadata: overrides?.providerMetadata,
    });
    return this;
  }

  reasoningFile(overrides?: Partial<ReasoningFilePayload>): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: "reasoning-file",
      url: overrides?.url ?? "",
      mediaType: overrides?.mediaType ?? "application/octet-stream",
      providerMetadata: overrides?.providerMetadata,
    });
    return this;
  }

  custom(kind?: string, providerMetadata?: ProviderMetadata): EventWriter<DATA, TOOLS> {
    this.writer.write({
      type: "custom",
      kind: (kind ?? "custom.event") as `${string}.${string}`,
      providerMetadata,
    });
    return this;
  }

  start(messageId?: string, messageMetadata?: unknown): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "start", messageId, messageMetadata });
    return this;
  }

  finish(): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "finish" });
    return this;
  }

  stepStart(): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "start-step" });
    return this;
  }

  finishStep(): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "finish-step" });
    return this;
  }

  abort(reason?: string): EventWriter<DATA, TOOLS> {
    this.writer.write({ type: "abort", reason });
    return this;
  }

  getRawWriter(): UIMessageStreamWriter {
    return this.writer;
  }
}
