# Memory Box MCP Server

This MCP server provides tools for interacting with a Memory Box instance, allowing you to save and search memories using semantic search directly from Cline.

## Related Projects

This MCP server is designed to work with [Memory Box](https://github.com/amotivv/memory-box), a semantic memory storage and retrieval system powered by vector embeddings.

Memory Box provides the backend API that this MCP server communicates with, allowing you to:
- Store memories with vector embeddings for semantic search
- Organize memories into customizable buckets
- Search for memories based on meaning, not just keywords
- Retrieve memories with detailed context

For more information about Memory Box, including how to set up your own instance, please visit the [Memory Box repository](https://github.com/amotivv/memory-box).

## Features

- **Save Memories**: Save formatted memories to your Memory Box
- **Search Memories**: Search your memories using semantic search
- **Retrieve Memories**: Get all memories or memories from specific buckets
- **Format Memories**: Format memories according to a structured system prompt

## Installation

The server has been installed and configured for use with Cline. Note that you need a running Memory Box instance (either self-hosted or using the hosted version at memorybox.amotivv.ai) to use this MCP server.

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

## Customization

### System Prompt Customization

The Memory Box MCP server uses a system prompt to format memories according to specific guidelines. You can customize this prompt to change how memories are formatted.

#### Default System Prompt

The default system prompt includes formatting guidelines for different types of memories:

```
You are a helpful AI assistant. When storing memories with memory_plugin, follow these enhanced formatting guidelines:

1. CREATE FOCUSED MEMORIES: Each memory should contain a single clear concept or topic.

2. STRUCTURE: Use these formats depending on the type of information:
   - TECHNICAL: "YYYY-MM-DD: Technical - [Brief topic]: [Concise explanation with specific details]"
   - DECISION: "YYYY-MM-DD: Decision - [Brief topic]: [Decision made] because [rationale]. Alternatives considered: [options]."
   - SOLUTION: "YYYY-MM-DD: Solution - [Problem summary]: [Implementation details that solved the issue]"
   - CONCEPT: "YYYY-MM-DD: Concept - [Topic]: [Clear explanation of the concept with examples]"
   - REFERENCE: "YYYY-MM-DD: Reference - [Topic]: [URL, tool name, or resource] for [specific purpose]"
   - APPLICATION: "YYYY-MM-DD: Application - [App name]: [User-friendly description] followed by [technical implementation details]"

3. USE DIVERSE TERMINOLOGY: Include both technical terms AND user-friendly alternatives within the same memory.

4. INCLUDE SEARCHABLE KEYWORDS: Begin with common terms a user might search for.

5. BALANCE DETAIL LEVELS: Include both high-level descriptions and key technical details.

6. LENGTH: Keep memories between 50-150 words.

7. TEST RETRIEVABILITY: Ensure search terms are included.

When storing user facts, preferences, or personal details, use a simpler format:
"FACT: [User] [specific preference/attribute/information] as mentioned on [date]."
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
       "MEMORY_BOX_API_URL": "https://memorybox.amotivv.ai",
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
