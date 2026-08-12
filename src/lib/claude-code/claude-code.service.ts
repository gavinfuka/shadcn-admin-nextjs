import path from "path"
import { Options, query, SDKUserMessage, renameSession, tagSession, deleteSession, foldSessionSummary, forkSession, getSessionInfo, getSessionMessages, listSessions, SessionMessage } from "@anthropic-ai/claude-agent-sdk"
import type { UIMessage } from "ai"
import fs from "fs"
import { v4 } from "uuid"
import { buildToolCallMap, toUIMessage } from "./utils/session-message-mapper"

export class ClaudeCodeService {
  defaultOptions: Options
  sandBoxId: string | undefined
  sessionId: string | undefined
  BASE_CLAUDE_CONFIG_DIR: string

  private static readonly ID_REGEX = /^[a-zA-Z0-9_-]+$/
  private static readonly FILE_PATH_REGEX = /^[a-zA-Z0-9_/.\- ]+$/

  private static isValidSandboxId(sandboxId: string) {
    return ClaudeCodeService.ID_REGEX.test(sandboxId)
  }

  private static isValidSessionId(sessionId: string) {
    return ClaudeCodeService.ID_REGEX.test(sessionId)
  }

  private static isValidFilePath(filePath: string) {
    return ClaudeCodeService.FILE_PATH_REGEX.test(filePath)
  }

  private setActiveClaudeConfigDir(sandboxId?: string): string | undefined {
    if (!sandboxId) return
    const normalizedSandboxId = sandboxId?.trim()
    const activeClaudeConfigDir = normalizedSandboxId ? path.join(this.BASE_CLAUDE_CONFIG_DIR, ".sandboxes", normalizedSandboxId, ".claude") : undefined
    process.env.CLAUDE_CONFIG_DIR = activeClaudeConfigDir
    return activeClaudeConfigDir
  }

  constructor(sandboxId?: string) {
    this.BASE_CLAUDE_CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || process.cwd()
    // this.BASE_CLAUDE_CONFIG_DIR = process.env.BASE_CLAUDE_CONFIG_DIR || "/mnt/efs"

    const normalizedSandboxId = sandboxId?.trim()
    this.sandBoxId = normalizedSandboxId

    const ACTIVE_CLAUDE_CONFIG_DIR = this.setActiveClaudeConfigDir(normalizedSandboxId)

    this.defaultOptions = {
      // pathToClaudeCodeExecutable: cliPath,
      cwd: ACTIVE_CLAUDE_CONFIG_DIR,
      env: {
        ...process.env, //
        ANTHROPIC_AUTH_TOKEN: `${process.env.OPENAI_API_KEY}`,
        ANTHROPIC_BASE_URL: `${process.env.OPENAI_BASE_URL}`,
        // SKILLS_TARGET_REPO: `${process.env.SKILLS_TARGET_REPO}`,
        CLAUDE_CONFIG_DIR: ACTIVE_CLAUDE_CONFIG_DIR,
      },
      model: `${process.env.COPILOT_MODEL}`,

      skills: "all",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      allowedTools: [
        //
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
        // "NotebookEdit",
        "Read",
        "ScheduleWakeup",
        // "Skill",
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
    this.sessionId = sessionId
    if (this.sandBoxId && !sessionId) {
      // For a fresh session scoped to an explicit sandbox, ensure it exists.
      this.checkSandboxExists(this.BASE_CLAUDE_CONFIG_DIR, this.sandBoxId)
    } else if (!this.sandBoxId) {
      this.initSandBox(this.BASE_CLAUDE_CONFIG_DIR)
    }
  }

  private initSandBox(baseClaudeConfigDir: string, sandboxId: string = v4()) {
    const sourceClaudeDir = path.join(process.cwd(), ".claude")
    const sandboxClaudeDir = path.join(baseClaudeConfigDir, ".sandboxes", sandboxId, ".claude")
    const sandboxCwd = path.join(baseClaudeConfigDir, ".sandboxes", sandboxId)
    const sourceClaudeMd = path.join(process.cwd(), "Claude.md")
    const sandboxClaudeMd = path.join(sandboxCwd, "Claude.md")

    fs.mkdirSync(path.dirname(sandboxClaudeDir), { recursive: true })

    if (fs.existsSync(sandboxClaudeDir)) return

    fs.cpSync(sourceClaudeDir, sandboxClaudeDir, { recursive: true })

    if (fs.existsSync(sourceClaudeMd) && !fs.existsSync(sandboxClaudeMd)) {
      fs.cpSync(sourceClaudeMd, sandboxClaudeMd)
    }
  }

  private checkSandboxExists(baseClaudeConfigDir: string, sandboxId: string) {
    const sandboxClaudeDir = path.join(baseClaudeConfigDir, ".sandboxes", sandboxId, ".claude")
    if (!fs.existsSync(sandboxClaudeDir)) {
      this.initSandBox(baseClaudeConfigDir, sandboxId)
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
    if (this.sessionId) this.defaultOptions.resume = this.sessionId

    const options = {
      ...this.defaultOptions,
      mcpServers: mcpServers,
      ///mcp__{server_name}__{tool_name}
      allowedTools: [...(this.defaultOptions.allowedTools ?? []), ...(extraAllowedTools ?? [])],
    }

    return query({
      options: options,
      prompt,
    })
  }

  async getSessionMessages(sandboxId: string, sessionId: string) {
    const normalizedSandboxId = sandboxId?.trim()
    const normalizedSessionId = sessionId?.trim()

    try {
      this.setActiveClaudeConfigDir(normalizedSandboxId)
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
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
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

  async getSeessions(sandboxId: string) {
    const normalizedSandboxId = sandboxId?.trim()
    if (!normalizedSandboxId) {
      throw new Error("sandboxId is required")
    }

    try {
      this.setActiveClaudeConfigDir(normalizedSandboxId)
      const sessions = await listSessions() // SDKSessionInfo[]

      return {
        sandboxId: normalizedSandboxId,
        sessions,
        count: sessions.length,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {
          sandboxId: normalizedSandboxId,
          sessions: [],
          count: 0,
        }
      }

      throw error
    }
  }

  async listClaudeFiles(sandboxId: string) {
    const normalizedSandboxId = sandboxId?.trim()

    if (!normalizedSandboxId) {
      throw new Error("sandboxId is required")
    }

    if (!ClaudeCodeService.isValidSandboxId(normalizedSandboxId)) {
      throw new Error("sandboxId contains invalid characters")
    }

    const claudeDir = path.join(this.BASE_CLAUDE_CONFIG_DIR, ".sandboxes", normalizedSandboxId, ".claude")

    try {
      const files = await this.findAllFiles(claudeDir)
      const relativeFiles = files.map((filePath) => path.relative(claudeDir, filePath))

      return {
        sandboxId: normalizedSandboxId,
        files: relativeFiles,
        count: relativeFiles.length,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
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
    const normalizedSandboxId = sandboxId?.trim()
    const normalizedFilePath = filePath?.trim()

    if (!normalizedSandboxId) {
      throw new Error("sandboxId is required")
    }

    if (!ClaudeCodeService.isValidSandboxId(normalizedSandboxId)) {
      throw new Error("sandboxId contains invalid characters")
    }

    if (!normalizedFilePath) {
      throw new Error("filePath is required")
    }

    if (!ClaudeCodeService.isValidFilePath(normalizedFilePath)) {
      throw new Error("filePath contains invalid characters")
    }

    const relativeFilePath = normalizedFilePath.replace(/^\.claude\//, "")
    const fullPath = path.join(this.BASE_CLAUDE_CONFIG_DIR, ".sandboxes", normalizedSandboxId, ".claude", relativeFilePath)
    const resolvedPath = path.resolve(fullPath)
    const claudeDir = path.resolve(path.join(this.BASE_CLAUDE_CONFIG_DIR, ".sandboxes", normalizedSandboxId, ".claude"))

    if (!resolvedPath.startsWith(claudeDir)) {
      throw new Error("filePath is outside the sandbox .claude directory")
    }

    const content = await fs.promises.readFile(resolvedPath, "utf8")
    return content
  }
}
