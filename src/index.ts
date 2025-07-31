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
// Add immediate debug output
console.error("DEBUG: Memory Box MCP Server loading...");

// Configuration from environment variables
const MEMORY_BOX_API_URL = process.env.MEMORY_BOX_API_URL || "https://memorybox.amotivv.ai";
const MEMORY_BOX_TOKEN = process.env.MEMORY_BOX_TOKEN || "";
const DEFAULT_BUCKET = process.env.DEFAULT_BUCKET || "General";

console.error("DEBUG: Environment loaded");



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
   * Get a list of all available buckets
   */
  async getBuckets(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/buckets`,
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
          `Failed to get buckets: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Save a memory to Memory Box with support for source_type and reference_data
   */
  async saveMemory(
    text?: string,
    rawContent?: string,
    bucketId: string = DEFAULT_BUCKET, 
    sourceType: string = "llm_plugin",
    referenceData?: any
  ): Promise<any> {
    try {
      // Validate that either text or raw_content is provided
      if (!text && !rawContent) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Either text or raw_content must be provided"
        );
      }

      // Build the request body
      const requestBody: any = {
        bucketId,
        source_type: sourceType
      };

      // Add text or raw_content
      if (text) {
        requestBody.text = text;
      } else if (rawContent) {
        requestBody.raw_content = rawContent;
      }

      // Add reference_data if provided
      if (referenceData) {
        // Validate that platform is provided if reference_data is used
        if (!referenceData.source?.platform) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "reference_data.source.platform is required when using reference_data"
          );
        }
        requestBody.reference_data = referenceData;
      } else {
        // Add default reference_data for Claude/VSCode integration
        requestBody.reference_data = {
          source: {
            platform: "claude_desktop",
            type: "llm_plugin",
            version: "1.0"
          }
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/api/v2/memory`,
        requestBody,
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
   * Search memories using semantic search with pagination and date sorting
   */
  async searchMemories(
    query: string,
    options?: {
      bucketId?: string;
      sourceType?: string;
      limit?: number;
      offset?: number;
      debug?: boolean;
      includeReferenceData?: boolean;
      dateSort?: boolean;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<any> {
    try {
      const params: any = { query };
      
      if (options) {
        if (options.bucketId !== undefined) params.bucketId = options.bucketId;
        if (options.sourceType !== undefined) params.source_type = options.sourceType;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.offset !== undefined) params.offset = options.offset;
        if (options.debug !== undefined) params.debug = options.debug;
        if (options.includeReferenceData !== undefined) params.include_reference_data = options.includeReferenceData;
        if (options.dateSort !== undefined) params.date_sort = options.dateSort;
        if (options.sortOrder !== undefined) params.sort_order = options.sortOrder;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params,
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
   * Get all memories with pagination support
   */
  async getAllMemories(options?: {
    all?: boolean;
    bucketId?: string;
    sourceType?: string;
    limit?: number;
    offset?: number;
    includeReferenceData?: boolean;
    dateSort?: boolean;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    try {
      const params: any = {};
      
      if (options) {
        if (options.all !== undefined) params.all = options.all;
        if (options.bucketId !== undefined) params.bucketId = options.bucketId;
        if (options.sourceType !== undefined) params.source_type = options.sourceType;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.offset !== undefined) params.offset = options.offset;
        if (options.includeReferenceData !== undefined) params.include_reference_data = options.includeReferenceData;
        if (options.dateSort !== undefined) params.date_sort = options.dateSort;
        if (options.sortOrder !== undefined) params.sort_order = options.sortOrder;
      } else {
        params.all = true; // Default behavior for backward compatibility
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params,
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
  async getBucketMemories(
    bucketId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeReferenceData?: boolean;
    }
  ): Promise<any> {
    try {
      const params: any = { bucketId };
      
      if (options) {
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.offset !== undefined) params.offset = options.offset;
        if (options.includeReferenceData !== undefined) params.include_reference_data = options.includeReferenceData;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory`,
        {
          params,
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
  
  /**
   * Get memory processing status
   */
  async getMemoryStatus(memoryId: number): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory/${memoryId}/status`,
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
          `Failed to get memory status: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }
  
  /**
   * Get related memories for a specific memory
   */
  async getRelatedMemories(memoryId: number, minSimilarity: number = 0.7): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2/memory/${memoryId}/related`,
        {
          params: { min_similarity: minSimilarity },
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
          `Failed to get related memories: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Create a new bucket
   */
  async createBucket(bucketName: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v2/buckets`,
        {},
        {
          params: { bucket_name: bucketName },
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
          `Failed to create bucket: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Delete a bucket
   */
  async deleteBucket(bucketName: string, force: boolean = false): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/v2/buckets/${bucketName}`,
        {
          params: { force },
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
          `Failed to delete bucket: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(
    memoryId: number,
    updates: {
      text?: string;
      rawContent?: string;
      bucketId?: string;
      sourceType?: string;
      referenceData?: any;
    }
  ): Promise<any> {
    try {
      // Validate that at least one update field is provided
      if (!updates.text && !updates.rawContent && !updates.bucketId && 
          !updates.sourceType && !updates.referenceData) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "At least one of text, raw_content, bucket_id, source_type, or reference_data must be provided"
        );
      }

      const requestBody: any = {};
      
      if (updates.text !== undefined) {
        requestBody.text = updates.text;
      }
      
      if (updates.rawContent !== undefined) {
        requestBody.raw_content = updates.rawContent;
      }
      
      if (updates.bucketId !== undefined) {
        requestBody.bucketId = updates.bucketId;
      }
      
      if (updates.sourceType !== undefined) {
        requestBody.source_type = updates.sourceType;
      }
      
      if (updates.referenceData !== undefined) {
        requestBody.reference_data = updates.referenceData;
      }

      const response = await axios.put(
        `${this.baseUrl}/api/v2/memory/${memoryId}`,
        requestBody,
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
          `Failed to update memory: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: number): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/v2/memory/${memoryId}`,
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
          `Failed to delete memory: ${error.response?.data?.detail || error.message}`
        );
      }
      throw error;
    }
  }
}


/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "memory-box-mcp",
    version: "1.0.0",
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
        description: "Save a memory to Memory Box",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The memory content to save (either text OR raw_content required)"
            },
            raw_content: {
              type: "string",
              description: "Raw content for processing (alternative to text)"
            },
            bucket_id: {
              type: "string",
              description: `The bucket to save the memory to (default: "${DEFAULT_BUCKET}")`
            },
            source_type: {
              type: "string",
              description: "Type of memory source (default: 'llm_plugin')"
            },
            reference_data: {
              type: "object",
              description: "Structured metadata for memory storage",
              properties: {
                source: {
                  type: "object",
                  required: ["platform"],
                  properties: {
                    platform: { type: "string", description: "Platform identifier (required)" },
                    type: { type: "string", description: "Source type" },
                    version: { type: "string", description: "Version info" },
                    url: { type: "string", description: "Source URL" },
                    title: { type: "string", description: "Source title" },
                    additional_metadata: { type: "object", description: "Extra metadata" }
                  }
                },
                context: {
                  type: "object",
                  properties: {
                    related_memories: { type: "array", items: { type: "object" }, description: "Related memory references" },
                    conversation_id: { type: "string", description: "Conversation identifier" },
                    message_id: { type: "string", description: "Message identifier" }
                  }
                },
                content_context: {
                  type: "object",
                  properties: {
                    url: { type: "string", description: "Content URL" },
                    title: { type: "string", description: "Content title" },
                    surrounding_text: { type: "string", description: "Context around selection" },
                    selected_text: { type: "string", description: "Selected text" },
                    additional_context: { type: "object", description: "Extra context" }
                  }
                }
              }
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
              description: "The search query (semantic search)"
            },
            bucket_id: {
              type: "string",
              description: "Filter to specific bucket"
            },
            source_type: {
              type: "string",
              description: "Filter by source type"
            },
            limit: {
              type: "integer",
              description: "Maximum number of results to return (1-100, default: 10)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "integer",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            },
            debug: {
              type: "boolean",
              description: "Include debug information in results (default: false)"
            },
            include_reference_data: {
              type: "boolean",
              description: "Include reference data in response (default: false)"
            },
            date_sort: {
              type: "boolean",
              description: "Sort semantic search results by date after similarity filtering (default: false)"
            },
            sort_order: {
              type: "string",
              description: "Sort order when date_sort is enabled (default: 'desc')",
              enum: ["asc", "desc"]
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_all_memories",
        description: "Retrieve all memories with pagination support",
        inputSchema: {
          type: "object",
          properties: {
            all: {
              type: "boolean",
              description: "Get all memories (overrides pagination, default: false)"
            },
            bucket_id: {
              type: "string",
              description: "Filter to specific bucket"
            },
            source_type: {
              type: "string",
              description: "Filter by source type"
            },
            limit: {
              type: "integer",
              description: "Maximum number of results to return (1-100, default: 10)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "integer",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            },
            include_reference_data: {
              type: "boolean",
              description: "Include reference data in response (default: false)"
            },
            date_sort: {
              type: "boolean",
              description: "Sort results by date (default: false)"
            },
            sort_order: {
              type: "string",
              description: "Sort order (default: 'desc')",
              enum: ["asc", "desc"]
            }
          }
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
            },
            limit: {
              type: "integer",
              description: "Maximum number of results to return (1-100, default: 10)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "integer",
              description: "Number of results to skip for pagination (default: 0)",
              minimum: 0
            },
            include_reference_data: {
              type: "boolean",
              description: "Include reference data in response (default: false)"
            }
          },
          required: ["bucket_id"]
        }
      },
      {
        name: "get_related_memories",
        description: "Find semantically similar memories to a specific memory",
        inputSchema: {
          type: "object",
          properties: {
            memory_id: {
              type: "integer",
              description: "The ID of the memory to find related memories for"
            },
            min_similarity: {
              type: "number",
              description: "Minimum similarity threshold (0.0-1.0) for related memories (default: 0.7)"
            }
          },
          required: ["memory_id"]
        }
      },
      {
        name: "check_memory_status",
        description: "Check the processing status of a memory",
        inputSchema: {
          type: "object",
          properties: {
            memory_id: {
              type: "integer",
              description: "The ID of the memory to check status for"
            }
          },
          required: ["memory_id"]
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
      },
      {
        name: "get_buckets",
        description: "Retrieve a list of all available buckets",
        inputSchema: {
          type: "object",
          properties: {
            // No specific parameters needed for this operation
          }
        }
      },
      {
        name: "create_bucket",
        description: "Create a new bucket for organizing memories",
        inputSchema: {
          type: "object",
          properties: {
            bucket_name: {
              type: "string",
              description: "Name of the bucket to create"
            }
          },
          required: ["bucket_name"]
        }
      },
      {
        name: "delete_bucket",
        description: "Delete a bucket (empty by default, use force to delete with content)",
        inputSchema: {
          type: "object",
          properties: {
            bucket_name: {
              type: "string",
              description: "Name of the bucket to delete"
            },
            force: {
              type: "boolean",
              description: "Force deletion even if bucket contains memories (default: false)"
            }
          },
          required: ["bucket_name"]
        }
      },
      {
        name: "update_memory",
        description: "Update an existing memory including text, bucket, and relationships",
        inputSchema: {
          type: "object",
          properties: {
            memory_id: {
              type: "integer",
              description: "The ID of the memory to update"
            },
            text: {
              type: "string",
              description: "New text content for the memory"
            },
            raw_content: {
              type: "string",
              description: "New raw content for the memory"
            },
            bucket_id: {
              type: "string",
              description: "Move memory to different bucket"
            },
            source_type: {
              type: "string",
              description: "Update source type"
            },
            reference_data: {
              type: "object",
              description: "Updated reference data (same structure as save_memory)"
            }
          },
          required: ["memory_id"]
        }
      },
      {
        name: "delete_memory",
        description: "Delete a specific memory",
        inputSchema: {
          type: "object",
          properties: {
            memory_id: {
              type: "integer",
              description: "The ID of the memory to delete"
            }
          },
          required: ["memory_id"]
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
      const text = request.params.arguments?.text ? String(request.params.arguments.text) : undefined;
      const rawContent = request.params.arguments?.raw_content ? String(request.params.arguments.raw_content) : undefined;
      const bucketId = String(request.params.arguments?.bucket_id || DEFAULT_BUCKET);
      const sourceType = String(request.params.arguments?.source_type || "llm_plugin");
      const referenceData = request.params.arguments?.reference_data;

      if (!text && !rawContent) {
        throw new McpError(ErrorCode.InvalidParams, "Either text or raw_content is required");
      }

      // Save the memory
      const result = await memoryBoxClient.saveMemory(text, rawContent, bucketId, sourceType, referenceData);

      return {
        content: [{
          type: "text",
          text: `Memory saved successfully with ID: ${result.id}`
        }]
      };
    }

    case "search_memories": {
      const query = String(request.params.arguments?.query || "");
      
      if (!query) {
        throw new McpError(ErrorCode.InvalidParams, "Query is required");
      }

      const options = {
        bucketId: request.params.arguments?.bucket_id ? String(request.params.arguments.bucket_id) : undefined,
        sourceType: request.params.arguments?.source_type ? String(request.params.arguments.source_type) : undefined,
        limit: request.params.arguments?.limit ? Number(request.params.arguments.limit) : undefined,
        offset: request.params.arguments?.offset ? Number(request.params.arguments.offset) : undefined,
        debug: Boolean(request.params.arguments?.debug || false),
        includeReferenceData: Boolean(request.params.arguments?.include_reference_data || false),
        dateSort: Boolean(request.params.arguments?.date_sort || false),
        sortOrder: request.params.arguments?.sort_order as 'asc' | 'desc' | undefined
      };

      // Search memories
      const result = await memoryBoxClient.searchMemories(query, options);

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
      if (options.debug && result.debug) {
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
      const options = {
        all: Boolean(request.params.arguments?.all || false),
        bucketId: request.params.arguments?.bucket_id ? String(request.params.arguments.bucket_id) : undefined,
        sourceType: request.params.arguments?.source_type ? String(request.params.arguments.source_type) : undefined,
        limit: request.params.arguments?.limit ? Number(request.params.arguments.limit) : undefined,
        offset: request.params.arguments?.offset ? Number(request.params.arguments.offset) : undefined,
        includeReferenceData: Boolean(request.params.arguments?.include_reference_data || false),
        dateSort: Boolean(request.params.arguments?.date_sort || false),
        sortOrder: request.params.arguments?.sort_order as 'asc' | 'desc' | undefined
      };

      // Get memories
      const result = await memoryBoxClient.getAllMemories(options);

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

      const options = {
        limit: request.params.arguments?.limit ? Number(request.params.arguments.limit) : undefined,
        offset: request.params.arguments?.offset ? Number(request.params.arguments.offset) : undefined,
        includeReferenceData: Boolean(request.params.arguments?.include_reference_data || false)
      };

      // Get memories from the specified bucket
      const result = await memoryBoxClient.getBucketMemories(bucketId, options);

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
    
    case "get_related_memories": {
      // Validate parameters
      const memoryId = request.params.arguments?.memory_id;
      const minSimilarity = Number(request.params.arguments?.min_similarity) || 0.7;
      
      if (!memoryId) {
        throw new McpError(ErrorCode.InvalidParams, "Memory ID is required");
      }
      
      // Get related memories
      const result = await memoryBoxClient.getRelatedMemories(Number(memoryId), minSimilarity);
      
      // Format the results
      let responseText = `Related memories for memory ID ${memoryId} (min similarity: ${minSimilarity * 100}%):\n\n`;
      
      if (result.items && result.items.length > 0) {
        result.items.forEach((memory: any, index: number) => {
          const similarity = memory.similarity ? ` (${Math.round(memory.similarity * 100)}% similar)` : "";
          responseText += `${index + 1}. [ID: ${memory.id}]${similarity} ${memory.text}\n\n`;
        });
      } else {
        responseText += "No related memories found.";
      }
      
      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
    
    case "check_memory_status": {
      // Validate parameters
      const memoryId = request.params.arguments?.memory_id;
      
      if (!memoryId) {
        throw new McpError(ErrorCode.InvalidParams, "Memory ID is required");
      }
      
      // Get memory status
      const result = await memoryBoxClient.getMemoryStatus(Number(memoryId));
      
      // Format the results
      let responseText = `Memory status for ID ${memoryId}:\n\n`;
      responseText += `Status: ${result.processing_status}\n`;
      
      if (result.processed_at) {
        responseText += `Processed at: ${result.processed_at}\n`;
      }
      
      if (result.attempts !== null && result.attempts !== undefined) {
        responseText += `Processing attempts: ${result.attempts}\n`;
      }
      
      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
    
    case "get_buckets": {
      // Get all available buckets
      const result = await memoryBoxClient.getBuckets();
      
      // Format the results
      let responseText = "Available buckets:\n\n";
      
      if (result.items && result.items.length > 0) {
        result.items.forEach((bucket: any, index: number) => {
          responseText += `${index + 1}. ${bucket.name} (ID: ${bucket.id})`;
          
          // Add memory count if available
          if (bucket.memory_count !== undefined) {
            responseText += ` - ${bucket.memory_count} memories`;
          }
          
          // Add creation date if available
          if (bucket.created_at) {
            responseText += ` - Created: ${bucket.created_at}`;
          }
          
          responseText += "\n";
        });
      } else {
        responseText += "No buckets found.";
      }
      
      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    case "create_bucket": {
      const bucketName = String(request.params.arguments?.bucket_name || "");

      if (!bucketName) {
        throw new McpError(ErrorCode.InvalidParams, "Bucket name is required");
      }

      // Create the bucket
      const result = await memoryBoxClient.createBucket(bucketName);

      return {
        content: [{
          type: "text",
          text: `Bucket "${bucketName}" created successfully!\n\n${result.message || "The bucket is now available for storing memories."}`
        }]
      };
    }

    case "delete_bucket": {
      const bucketName = String(request.params.arguments?.bucket_name || "");
      const force = Boolean(request.params.arguments?.force || false);

      if (!bucketName) {
        throw new McpError(ErrorCode.InvalidParams, "Bucket name is required");
      }

      // Delete the bucket
      const result = await memoryBoxClient.deleteBucket(bucketName, force);

      return {
        content: [{
          type: "text",
          text: `Bucket "${bucketName}" deleted successfully!\n\n${result.message || "The bucket has been removed."}`
        }]
      };
    }

    case "update_memory": {
      const memoryId = request.params.arguments?.memory_id;

      if (!memoryId) {
        throw new McpError(ErrorCode.InvalidParams, "Memory ID is required");
      }

      const updates = {
        text: request.params.arguments?.text ? String(request.params.arguments.text) : undefined,
        rawContent: request.params.arguments?.raw_content ? String(request.params.arguments.raw_content) : undefined,
        bucketId: request.params.arguments?.bucket_id ? String(request.params.arguments.bucket_id) : undefined,
        sourceType: request.params.arguments?.source_type ? String(request.params.arguments.source_type) : undefined,
        referenceData: request.params.arguments?.reference_data
      };

      // Update the memory
      const result = await memoryBoxClient.updateMemory(Number(memoryId), updates);

      let responseText = `Memory ${memoryId} updated successfully!`;
      
      if (result.processing_status === "requires_processing") {
        responseText += "\n\nNote: The memory is being reprocessed and will be available shortly.";
      } else if (result.text) {
        responseText += `\n\nUpdated content:\n${result.text}`;
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }

    case "delete_memory": {
      const memoryId = request.params.arguments?.memory_id;

      if (!memoryId) {
        throw new McpError(ErrorCode.InvalidParams, "Memory ID is required");
      }

      // Delete the memory
      const result = await memoryBoxClient.deleteMemory(Number(memoryId));

      return {
        content: [{
          type: "text",
          text: `Memory ${memoryId} deleted successfully!\n\n${result.message || "The memory has been permanently removed."}`
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
  try {
    console.error("DEBUG: Starting Memory Box MCP Server");
    console.error("DEBUG: Environment variables:");
    console.error(`  MEMORY_BOX_API_URL: ${MEMORY_BOX_API_URL}`);
    console.error(`  MEMORY_BOX_TOKEN: ${MEMORY_BOX_TOKEN ? 'Set' : 'Not set'}`);
    console.error(`  DEFAULT_BUCKET: ${DEFAULT_BUCKET}`);
    console.error(`  NODE_ENV: ${process.env.NODE_ENV}`);
    
    const transport = new StdioServerTransport();
    console.error("DEBUG: Created transport");
    
    await server.connect(transport);
    console.error("DEBUG: Server connected successfully");
    
    // The server is now running and will handle messages
    // Don't exit - let the server run
  } catch (error) {
    // Log error for debugging
    console.error("ERROR: Failed to start server:", error);
    console.error("ERROR: Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Add error handlers
process.on('uncaughtException', (error) => {
  console.error('ERROR: Uncaught exception:', error);
  console.error('ERROR: Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('ERROR: Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main();
