#!/usr/bin/env node

/**
 * Memory Box MCP Server
 * 
 * This MCP server provides tools for interacting with a Memory Box instance,
 * allowing users to save and search memories using semantic search.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { format } from "date-fns";
import { DEFAULT_SYSTEM_PROMPT, loadSystemPrompt, validateSystemPrompt } from "./system-prompt.js";

// Configuration from environment variables
const MEMORY_BOX_API_URL = process.env.MEMORY_BOX_API_URL || "https://memorybox.amotivv.ai";
const MEMORY_BOX_TOKEN = process.env.MEMORY_BOX_TOKEN || "";
const DEFAULT_BUCKET = process.env.DEFAULT_BUCKET || "General";

// Memory types for formatting
const MEMORY_TYPES = [
  "TECHNICAL",
  "DECISION",
  "SOLUTION",
  "CONCEPT",
  "REFERENCE",
  "APPLICATION",
  "FACT"
];

// Load and validate the system prompt
const SYSTEM_PROMPT = loadSystemPrompt();
if (process.env.SYSTEM_PROMPT && !validateSystemPrompt(SYSTEM_PROMPT)) {
  console.error("Warning: Custom system prompt may be missing required elements. Using it anyway, but formatting may not work as expected.");
}

/**
 * Format a byte size into a human-readable string
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Memory Box API Client
 * Handles communication with the Memory Box API
 */
class MemoryBoxClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Save a memory to Memory Box
   */
  async saveMemory(text: string, bucketId: string = DEFAULT_BUCKET): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v2/memory`,
        { text, bucketId },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to save memory: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search memories using semantic search
   */
  async searchMemories(query: string, debug: boolean = false): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params: { query, debug },
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to search memories: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get all memories
   */
  async getAllMemories(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params: { all: true },
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get all memories: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get memories from a specific bucket
   */
  async getBucketMemories(bucketId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params: { bucketId },
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get bucket memories: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get user usage statistics and plan information
   */
  async getUserStats(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/usage`,
        {
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to retrieve usage statistics: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }
}

/**
 * Format a memory according to the system prompt
 */
function formatMemory(text: string, type: string = "TECHNICAL"): string {
  // Validate memory type
  const memoryType = type.toUpperCase();
  if (!MEMORY_TYPES.includes(memoryType)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid memory type: ${type}. Must be one of: ${MEMORY_TYPES.join(", ")}`
    );
  }

  // Get current date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");

  // Format based on memory type
  if (memoryType === "FACT") {
    return `FACT: ${text} as mentioned on ${today}.`;
  }

  // For other memory types, use the standard format
  // Note: This is a simple implementation. In a real-world scenario,
  // you might want to use an LLM to format the memory more intelligently.
  const formattedType = memoryType.charAt(0) + memoryType.slice(1).toLowerCase();
  return `${today}: ${formattedType} - ${text}`;
}

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "memory-box-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Create Memory Box client
const memoryBoxClient = new MemoryBoxClient(MEMORY_BOX_API_URL, MEMORY_BOX_TOKEN);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_memory",
        description: "Save a memory to Memory Box with proper formatting",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The memory content to save"
            },
            bucket_id: {
              type: "string",
              description: `The bucket to save the memory to (default: "${DEFAULT_BUCKET}")`
            },
            format: {
              type: "boolean",
              description: "Whether to format the memory according to the system prompt (default: true)"
            },
            type: {
              type: "string",
              description: `The type of memory (${MEMORY_TYPES.join(", ")}) for formatting (default: "TECHNICAL")`
            }
          },
          required: ["text"]
        }
      },
      {
        name: "search_memories",
        description: "Search for memories using semantic search",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query"
            },
            debug: {
              type: "boolean",
              description: "Include debug information in results (default: false)"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_all_memories",
        description: "Retrieve all memories",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_bucket_memories",
        description: "Get memories from a specific bucket",
        inputSchema: {
          type: "object",
          properties: {
            bucket_id: {
              type: "string",
              description: "The bucket to retrieve memories from"
            }
          },
          required: ["bucket_id"]
        }
      },
      {
        name: "format_memory",
        description: "Format a text according to the memory system prompt without saving",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to format"
            },
            type: {
              type: "string",
              description: `The type of memory (${MEMORY_TYPES.join(", ")}) (default: "TECHNICAL")`
            }
          },
          required: ["text"]
        }
      },
      {
        name: "get_usage_stats",
        description: "Retrieve user usage statistics and plan information",
        inputSchema: {
          type: "object",
          properties: {
            // No specific parameters needed for this operation
          }
        }
      }
    ]
  };
});

/**
 * Handler for tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Validate token
  if (!MEMORY_BOX_TOKEN) {
    throw new McpError(
      ErrorCode.InternalError,
      "Memory Box token not configured. Please set the MEMORY_BOX_TOKEN environment variable."
    );
  }

  switch (request.params.name) {
    case "save_memory": {
      const text = String(request.params.arguments?.text || "");
      const bucketId = String(request.params.arguments?.bucket_id || DEFAULT_BUCKET);
      const shouldFormat = request.params.arguments?.format !== false; // Default to true
      const type = String(request.params.arguments?.type || "TECHNICAL");

      if (!text) {
        throw new McpError(ErrorCode.InvalidParams, "Text is required");
      }

      // Format the memory if requested
      const formattedText = shouldFormat ? formatMemory(text, type) : text;

      // Save the memory
      const result = await memoryBoxClient.saveMemory(formattedText, bucketId);

      return {
        content: [{
          type: "text",
          text: `Memory saved successfully with ID: ${result.id}\n\n${formattedText}`
        }]
      };
    }

    case "search_memories": {
      const query = String(request.params.arguments?.query || "");
      const debug = Boolean(request.params.arguments?.debug || false);

      if (!query) {
        throw new McpError(ErrorCode.InvalidParams, "Query is required");
      }

      // Search memories
      const result = await memoryBoxClient.searchMemories(query, debug);

      // Format the results
      let responseText = `Search results for "${query}":\n\n`;
      
      if (result.items && result.items.length > 0) {
        result.items.forEach((memory: any, index: number) => {
          const similarity = memory.similarity ? ` (${Math.round(memory.similarity * 100)}% match)` : "";
          responseText += `${index + 1}. ${similarity} ${memory.text}\n\n`;
        });
      } else {
        responseText += "No memories found matching your query.";
      }

      // Add debug information if requested
      if (debug && result.debug) {
        responseText += "\n\nDebug Information:\n";
        responseText += `Query: ${result.debug.query}\n`;
        responseText += `Query Terms: ${result.debug.query_terms.join(", ")}\n`;
        responseText += `Threshold: ${result.debug.threshold}\n`;
        responseText += `All Results: ${result.debug.all_results.length}\n`;
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    case "get_all_memories": {
      // Get all memories
      const result = await memoryBoxClient.getAllMemories();

      // Format the results
      let responseText = "All memories:\n\n";
      
      if (result.items && result.items.length > 0) {
        result.items.forEach((memory: any, index: number) => {
          responseText += `${index + 1}. [${memory.bucket_id}] ${memory.text}\n\n`;
        });
      } else {
        responseText += "No memories found.";
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    case "get_bucket_memories": {
      const bucketId = String(request.params.arguments?.bucket_id || "");

      if (!bucketId) {
        throw new McpError(ErrorCode.InvalidParams, "Bucket ID is required");
      }

      // Get memories from the specified bucket
      const result = await memoryBoxClient.getBucketMemories(bucketId);

      // Format the results
      let responseText = `Memories in bucket "${bucketId}":\n\n`;
      
      if (result.items && result.items.length > 0) {
        result.items.forEach((memory: any, index: number) => {
          responseText += `${index + 1}. ${memory.text}\n\n`;
        });
      } else {
        responseText += "No memories found in this bucket.";
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    case "format_memory": {
      const text = String(request.params.arguments?.text || "");
      const type = String(request.params.arguments?.type || "TECHNICAL");

      if (!text) {
        throw new McpError(ErrorCode.InvalidParams, "Text is required");
      }

      // Format the memory
      const formattedText = formatMemory(text, type);

      return {
        content: [{
          type: "text",
          text: `Formatted memory:\n\n${formattedText}`
        }]
      };
    }

    case "get_usage_stats": {
      // Get usage statistics
      const result = await memoryBoxClient.getUserStats();

      // Format the results in a user-friendly way
      let responseText = "Usage Statistics:\n\n";
      
      // Add plan information
      responseText += `Current Plan: ${result.plan}\n`;
      if (result.is_legacy_user) {
        responseText += "Status: Legacy User (No Enforced Limits)\n\n";
      } else {
        responseText += "Status: Standard User\n\n";
      }
      
      // Add current month usage
      responseText += "Current Month Usage:\n";
      responseText += `- Store Memory Operations: ${result.current_month_usage.store_memory_count}\n`;
      responseText += `- Search Memory Operations: ${result.current_month_usage.search_memory_count}\n`;
      responseText += `- API Calls: ${result.current_month_usage.api_call_count}\n`;
      responseText += `- Total Data Processed: ${formatBytes(result.current_month_usage.total_bytes_processed)}\n\n`;
      
      // Add limits if not a legacy user
      if (!result.is_legacy_user && result.limits) {
        responseText += "Plan Limits:\n";
        responseText += `- Store Memory Limit: ${result.limits.store_memory_limit} operations\n`;
        responseText += `- Search Memory Limit: ${result.limits.search_memory_limit} operations\n`;
        responseText += `- API Call Limit: ${result.limits.api_call_limit} operations\n`;
        responseText += `- Storage Limit: ${formatBytes(result.limits.storage_limit_bytes)}\n\n`;
      }
      
      // Add operation breakdown if available
      if (result.operations_breakdown && result.operations_breakdown.length > 0) {
        responseText += "Operation Breakdown:\n";
        result.operations_breakdown.forEach((op: any) => {
          responseText += `- ${op.operation}: ${op.count} operations\n`;
        });
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  // Log configuration
  console.error("Memory Box MCP Server starting with configuration:");
  console.error(`API URL: ${MEMORY_BOX_API_URL}`);
  console.error(`Token: ${MEMORY_BOX_TOKEN ? "Configured" : "Not configured"}`);
  console.error(`Default Bucket: ${DEFAULT_BUCKET}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memory Box MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
