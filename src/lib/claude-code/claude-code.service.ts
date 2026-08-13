import path from "path"
import { getSessionMessages, listSessions as listSdkSessions, query, type Options, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk"
import type { UIMessage } from "ai"
import fs from "fs"
import { buildToolCallMap, toUIMessage } from "./utils/session-message-mapper"

export class ClaudeCodeService {
  private static readonly DEFAULT_SANDBOX_ID = "default"

  private readonly baseClaudeConfigDir: string
  private readonly defaultOptions: Options
  private readonly sandboxId: string
  private sessionId?: string

  constructor(sandboxId = ClaudeCodeService.DEFAULT_SANDBOX_ID) {
    this.baseClaudeConfigDir = process.env.BASE_CLAUDE_CONFIG_DIR || process.cwd()
    this.sandboxId = sandboxId.trim()

    const activeClaudeConfigDir = this.activateSandbox(this.sandboxId)

    this.defaultOptions = {
      cwd: activeClaudeConfigDir,
      env: {
        ...process.env,
        ANTHROPIC_AUTH_TOKEN: `${process.env.OPENAI_API_KEY}`,
        ANTHROPIC_BASE_URL: `${process.env.OPENAI_BASE_URL}`,
        CLAUDE_CONFIG_DIR: activeClaudeConfigDir,
      },
      model: `${process.env.COPILOT_MODEL}`,
      skills: "all",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      allowedTools: [
        "Task",
        "AskUserQuestion",
        "Bash",
        "CronCreate",
        "CronDelete",
        "CronList",
        "Edit",
        "EnterPlanMode",
        "EnterWorktree",
        "ExitPlanMode",
        "ExitWorktree",
        "Glob",
        "Grep",
        "Read",
        "ScheduleWakeup",
        "TaskCreate",
        "TaskGet",
        "TaskList",
        "TaskOutput",
        "TaskStop",
        "TaskUpdate",
        "WebFetch",
        "WebSearch",
        "Write",
      ],
    }
  }

  setSession(sessionId?: string) {
    this.sessionId = sessionId?.trim() || undefined

    if (!this.sessionId) {
      this.ensureSandboxExists(this.sandboxId)
    }
  }

  private ensureSandboxExists(sandboxId: string) {
    const sourceClaudeDir = path.join(process.cwd(), ".claude")
    const sandboxClaudeDir = this.getClaudeDir(sandboxId)
    const sandboxCwd = path.dirname(sandboxClaudeDir)
    const sourceClaudeMd = path.join(process.cwd(), "Claude.md")
    const sandboxClaudeMd = path.join(sandboxCwd, "Claude.md")

    if (fs.existsSync(sandboxClaudeDir)) return

    fs.mkdirSync(sandboxCwd, { recursive: true })
    fs.cpSync(sourceClaudeDir, sandboxClaudeDir, { recursive: true })

    if (fs.existsSync(sourceClaudeMd) && !fs.existsSync(sandboxClaudeMd)) {
      fs.cpSync(sourceClaudeMd, sandboxClaudeMd)
    }
  }

  query({
    prompt,
    extraAllowedTools,
    mcpServers,
  }: {
    prompt:
      | string //
      | AsyncIterable<SDKUserMessage>
    mcpServers?: Options["mcpServers"]
    extraAllowedTools?: Options["allowedTools"]
  }) {
    const options: Options = {
      ...this.defaultOptions,
      ...(this.sessionId ? { resume: this.sessionId } : {}),
      mcpServers,
      allowedTools: [...(this.defaultOptions.allowedTools ?? []), ...(extraAllowedTools ?? [])],
    }

    return query({
      options: options,
      prompt,
    })
  }

  async getSessionMessages(sandboxId: string, sessionId: string) {
    const normalizedSandboxId = sandboxId.trim()
    const normalizedSessionId = sessionId.trim()

    try {
      this.activateSandbox(normalizedSandboxId)
      const sessionMessages = await getSessionMessages(normalizedSessionId)
      const toolCallMap = buildToolCallMap(sessionMessages)

      const messages = sessionMessages.map((entry, index) => toUIMessage(entry, index, toolCallMap)).filter((message): message is UIMessage => Boolean(message))

      return {
        sandboxId: normalizedSandboxId,
        sessionId: normalizedSessionId,
        messages,
        count: messages.length,
      }
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return {
          sandboxId: normalizedSandboxId,
          sessionId: normalizedSessionId,
          messages: [],
          count: 0,
        }
      }

      throw error
    }
  }

  async listSessions(sandboxId?: string) {
    const normalizedSandboxId = (sandboxId ?? this.sandboxId).trim()
    try {
      this.activateSandbox(normalizedSandboxId)
      const sessions = await listSdkSessions()

      return {
        sandboxId: normalizedSandboxId,
        sessions,
        count: sessions.length,
      }
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return {
          sandboxId: normalizedSandboxId,
          sessions: [],
          count: 0,
        }
      }

      throw error
    }
  }

  /** @deprecated Use listSessions instead. */
  getSeessions(sandboxId: string) {
    return this.listSessions(sandboxId)
  }

  async listClaudeFiles(sandboxId: string) {
    const normalizedSandboxId = sandboxId.trim()
    const claudeDir = this.getClaudeDir(normalizedSandboxId)

    try {
      const files = await this.findAllFiles(claudeDir)
      const relativeFiles = files.map((filePath) => path.relative(claudeDir, filePath))

      return {
        sandboxId: normalizedSandboxId,
        files: relativeFiles,
        count: relativeFiles.length,
      }
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        return {
          sandboxId: normalizedSandboxId,
          files: [],
          count: 0,
        }
      }

      throw error
    }
  }

  private async findAllFiles(rootDir: string): Promise<string[]> {
    const entries = await fs.promises.readdir(rootDir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const entryPath = path.join(rootDir, entry.name)
      const stats = await fs.promises.lstat(entryPath)

      if (stats.isSymbolicLink()) {
        files.push(entryPath)

        try {
          const linkTarget = await fs.promises.realpath(entryPath)
          const targetStats = await fs.promises.stat(linkTarget)

          if (targetStats.isDirectory()) {
            const nestedFiles = await this.findAllFiles(linkTarget)
            files.push(...nestedFiles.map((nestedPath) => entryPath + path.sep + path.relative(linkTarget, nestedPath)))
          }
        } catch {
          // Broken symlink: keep the symlink path in the listing.
        }

        continue
      }

      if (entry.isDirectory()) {
        const nestedFiles = await this.findAllFiles(entryPath)
        files.push(...nestedFiles)
        continue
      }

      if (entry.isFile()) {
        files.push(entryPath)
      }
    }

    return files
  }

  async readClaudeFile(sandboxId: string, filePath: string) {
    const normalizedSandboxId = sandboxId.trim()
    const normalizedFilePath = filePath.trim()

    const relativeFilePath = normalizedFilePath.replace(/^\.claude\//, "")
    const claudeDir = this.getClaudeDir(normalizedSandboxId)
    const resolvedPath = path.resolve(claudeDir, relativeFilePath)
    const relativeResolvedPath = path.relative(claudeDir, resolvedPath)

    if (relativeResolvedPath.startsWith("..") || path.isAbsolute(relativeResolvedPath)) {
      throw new Error("filePath is outside the sandbox .claude directory")
    }

    return fs.promises.readFile(resolvedPath, "utf8")
  }

  private getClaudeDir(sandboxId: string) {
    return path.resolve(this.baseClaudeConfigDir, ".sandboxes", encodeURIComponent(sandboxId), ".claude")
  }

  private activateSandbox(sandboxId: string) {
    const claudeConfigDir = this.getClaudeDir(sandboxId)
    process.env.CLAUDE_CONFIG_DIR = claudeConfigDir
    return claudeConfigDir
  }

  private isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
    return (error as NodeJS.ErrnoException).code === "ENOENT"
  }
}
