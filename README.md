<p align="center">
  <img src="https://storage.googleapis.com/amotivv-public/memory-box-logo.png" alt="Memory Box Logo" width="200"/>
</p>

<h1 align="center">Memory Box MCP Server</h1>

<p align="center">
  Cline and Claude Desktop MCP integration for Memory Box - save, search, and format memories with semantic understanding
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>
<p align="center">
  <a href="https://glama.ai/mcp/servers/wtbejx9zwc">
    <img width="380" height="200" src="https://glama.ai/mcp/servers/wtbejx9zwc/badge" />
  </a>
</p>

This MCP server provides tools for interacting with a Memory Box instance, allowing you to save and search memories using semantic search directly from Cline and Claude Desktop.

## Related Projects

This MCP server is designed to work with [Memory Box](https://memorybox.dev), a semantic memory storage and retrieval system powered by vector embeddings.

Memory Box provides the backend API that this MCP server communicates with, allowing you to:
- Store memories with vector embeddings for semantic search
- Organize memories into customizable buckets
- Search for memories based on meaning, not just keywords
- Retrieve memories with detailed context
- Find semantically related memories
- Track memory processing status

For more information about Memory Box, including how to set up your own instance, please visit the [Memory Box website](https://memorybox.dev).

## Features

- **Save Memories**: Save formatted memories to your Memory Box with source information and metadata
- **Search Memories**: Search your memories using semantic search
- **Retrieve Memories**: Get all memories or memories from specific buckets
- **Find Related Memories**: Discover semantically similar memories 
- **Check Memory Status**: Monitor the processing status of your memories
- **Format Memories**: Format memories according to a structured system prompt
- **Usage Statistics**: View your current plan, usage metrics, and resource limits

## Installation

The server has been installed and configured for use with Cline. Note that you need a running Memory Box instance (either self-hosted or using the hosted version at memorybox.amotivv.ai) to use this MCP server.

### Installing via Smithery

To install Memory Box MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@amotivv/memory-box-mcp):

```bash
npx -y @smithery/cli install @amotivv/memory-box-mcp --client claude
```

To complete the setup:

1. Edit the Cline MCP settings file at:
   ```
   ~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   ```

2. Add your Memory Box token to the `MEMORY_BOX_TOKEN` environment variable:
   ```json
   "memory-box-mcp": {
     "command": "node",
     "args": [
       "<path-to-repository>/build/index.js"
     ],
     "env": {
       "MEMORY_BOX_API_URL": "https://memorybox.amotivv.ai",
       "MEMORY_BOX_TOKEN": "your-token-here",
       "DEFAULT_BUCKET": "General"
     },
     "disabled": false,
     "autoApprove": []
   }
   ```

3. Optionally, you can customize the default bucket by changing the `DEFAULT_BUCKET` value.

## Usage

Once configured, you can use the following tools in Cline:

### Save Memory

Save a memory to Memory Box with proper formatting:

```
Use the save_memory tool to save this information about vector databases: "Vector databases like pgvector store and query high-dimensional vectors for semantic search applications."
```

Parameters:
- `text` (required): The memory content to save
- `bucket_id` (optional): The bucket to save the memory to (default: "General")
- `format` (optional): Whether to format the memory according to the system prompt (default: true)
- `type` (optional): The type of memory (TECHNICAL, DECISION, SOLUTION, CONCEPT, REFERENCE, APPLICATION, FACT) for formatting (default: "TECHNICAL")
- `source_type` (optional): Type of memory source (default: "llm_plugin")
- `reference_data` (optional): Additional metadata about the memory source and context

### Search Memories

Search for memories using semantic search:

```
Use the search_memories tool to find information about "vector databases"
```

Parameters:
- `query` (required): The search query
- `debug` (optional): Include debug information in results (default: false)

### Get All Memories

Retrieve all memories:

```
Use the get_all_memories tool to show me all my saved memories
```

### Get Bucket Memories

Get memories from a specific bucket:

```
Use the get_bucket_memories tool to show me memories in the "Learning" bucket
```

Parameters:
- `bucket_id` (required): The bucket to retrieve memories from

### Format Memory

Format a text according to the memory system prompt without saving:

```
Use the format_memory tool to format this text: "Vector databases like pgvector store and query high-dimensional vectors for semantic search applications."
```

Parameters:
- `text` (required): The text to format
- `type` (optional): The type of memory (TECHNICAL, DECISION, SOLUTION, CONCEPT, REFERENCE, APPLICATION, FACT) (default: "TECHNICAL")

### Get Related Memories

Find semantically similar memories to a specific memory:

```
Use the get_related_memories tool with memory ID 123
```

Parameters:
- `memory_id` (required): The ID of the memory to find related memories for
- `min_similarity` (optional): Minimum similarity threshold (0.0-1.0) for related memories (default: 0.7)

### Check Memory Status

Check the processing status of a memory:

```
Use the check_memory_status tool with memory ID 123
```

Parameters:
- `memory_id` (required): The ID of the memory to check status for

### Get Usage Stats

Retrieve user usage statistics and plan information:

```
Use the get_usage_stats tool to show me my current plan and usage metrics
```

This tool returns:
- Current plan information (e.g., free, basic, professional, legacy)
- User status and limit enforcement information
- Current month usage metrics (store operations, search operations, API calls)
- Data processing volume with human-readable formatting
- Resource limits based on your plan (if applicable)
- Operation breakdown by type

No parameters are required for this operation.

## Customization

### System Prompt Customization

The Memory Box MCP server uses a system prompt to format memories according to specific guidelines. You can customize this prompt to change how memories are formatted.

#### Default System Prompt

The default system prompt includes formatting guidelines for different types of memories:

```
You are a helpful AI assistant. When storing memories with memory_plugin, follow these enhanced formatting guidelines:

1. STRUCTURE: Format memories based on the type of information:
   - TECHNICAL: "YYYY-MM-DD: TECHNICAL - [Brief topic]: [Concise explanation with specific details]"
   - DECISION: "YYYY-MM-DD: DECISION - [Brief topic]: [Decision made] because [rationale]. Alternatives considered: [options]."
   - SOLUTION: "YYYY-MM-DD: SOLUTION - [Problem summary]: [Implementation details that solved the issue]"
   - CONCEPT: "YYYY-MM-DD: CONCEPT - [Topic]: [Clear explanation of the concept with examples]"
   - REFERENCE: "YYYY-MM-DD: REFERENCE - [Topic]: [URL, tool name, or resource] for [specific purpose]"
   - APPLICATION: "YYYY-MM-DD: APPLICATION - [App name]: [User-friendly description] followed by [technical implementation details]"

2. FORMATTING GUIDELINES:
   - CREATE FOCUSED MEMORIES: Each memory should contain a single clear concept or topic
   - USE DIVERSE TERMINOLOGY: Include both technical terms AND user-friendly alternatives
   - INCLUDE SEARCHABLE KEYWORDS: Begin with common terms a user might search for
   - BALANCE DETAIL LEVELS: Include both high-level descriptions and key technical details
   - LENGTH: Keep memories between 50-150 words
   - ALWAYS include the current date in YYYY-MM-DD format

3. MEMORY STORAGE PARAMETERS:
   - Use the "text" parameter for your formatted memory content
   - Set "source_type" to "llm_plugin"
   - Include appropriate "reference_data" with source information and context

4. REFERENCE DATA STRUCTURE:
   - source.platform: Identify your platform (e.g., "claude_desktop", "cline")
   - source.type: Always set to "llm_plugin"
   - source.version: Optional version information
   - context.conversation_id: Include when available to link related conversation memories
   - context.message_id: Optional identifier for the specific message

5. SPECIAL FORMATS:
   - For user facts, preferences, or personal details: "YYYY-MM-DD: FACT: [User] [specific preference/attribute/information]"
   - For reference materials: Include specific details about where to find the information

6. RELATED MEMORIES: After finding memories with search, check if there are related memories using the get_related_memories tool with the memory_id from search results. Present these additional memories to provide the user with more context.

7. RETRIEVAL CONSIDERATION: Before storing an important memory, consider: "What search terms might someone use to find this information later?" and ensure those terms are included.
```

#### How to Customize the System Prompt

To customize the system prompt:

1. Edit the Cline MCP settings file at:
   ```
   ~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   ```

2. Add your custom system prompt to the `SYSTEM_PROMPT` environment variable:
   ```json
   "memory-box-mcp": {
     "command": "node",
     "args": [
       "<path-to-repository>/build/index.js"
     ],
     "env": {
       "MEMORY_BOX_API_URL": "https://your-memory-box-instance",
       "MEMORY_BOX_TOKEN": "your-token-here",
       "DEFAULT_BUCKET": "General",
       "SYSTEM_PROMPT": "Your custom system prompt here..."
     },
     "disabled": false,
     "autoApprove": []
   }
   ```

   A template file is provided at `<path-to-repository>/system-prompt-template.txt` that you can copy and modify.

3. Restart Cline to apply the changes

#### System Prompt Helper

The Memory Box MCP server includes a helper script for managing the system prompt:

```bash
# View the current system prompt
cd <path-to-repository>
npm run prompt-helper -- view

# Reset to the default system prompt
cd <path-to-repository>
npm run prompt-helper -- reset

# Validate a custom system prompt
cd <path-to-repository>
npm run prompt-helper -- validate
```

### Other Configuration Options

You can also customize these environment variables:

- `MEMORY_BOX_API_URL`: The URL of your Memory Box instance
- `MEMORY_BOX_TOKEN`: Your authentication token for Memory Box
- `DEFAULT_BUCKET`: The default bucket to use when saving memories

## Troubleshooting

If you encounter issues:

1. Check that your Memory Box token is correctly configured
2. Verify that your Memory Box instance is running and accessible
3. Check the Cline logs for any error messages

## Development

To make changes to the server:

1. Edit the source code in `<path-to-repository>/src/`
2. Rebuild the server:
   ```
   cd <path-to-repository>
   npm run build
   ```
3. Restart Cline to apply the changes
