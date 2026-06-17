import { ToolSet } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { createBaseMcpServer } from "@corsair-dev/mcp";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { corsair } from "@/server/corsair";
import { DEFAULT_CALENDAR } from "@/server/db/schema/settings";
import { CalendarAgentPrefs } from "../prompts/calendar-agent.prompt";
import { buildEmailComposerAgent } from "../agents/email-composer.agent";
import { buildCalendarAgent } from "../agents/calendar.agent";

const mcpToolsCache = new Map<string, ToolSet>();

export function invalidateMcpCache(userId: string) {
  mcpToolsCache.delete(userId);
}

async function getMcpTools(userId: string): Promise<ToolSet> {
  if (mcpToolsCache.has(userId)) return mcpToolsCache.get(userId)!;

  const tenant = corsair.withTenant(userId);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const server = createBaseMcpServer({ corsair: tenant });
  await server.connect(serverTransport);
  const client = await createMCPClient({ transport: clientTransport });
  const tools = await client.tools();

  mcpToolsCache.set(userId, tools);
  return tools;
}

export async function createEmailsTools(
  userId: string,
  userName: string,
  timezone: string,
  currentDate: string,
  signature?: string,
  calendarPrefs?: CalendarAgentPrefs,
): Promise<ToolSet> {
  const mcpTools = await getMcpTools(userId);

  return {
    ...mcpTools,
    compose_email: buildEmailComposerAgent(userName, signature),
    calendar_agent: buildCalendarAgent(
      currentDate,
      timezone,
      mcpTools,
      calendarPrefs ?? DEFAULT_CALENDAR,
    ),
  };
}
