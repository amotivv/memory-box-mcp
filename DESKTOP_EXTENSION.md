# Memory Box Desktop Extension Guide

This guide covers the Memory Box Desktop Extension for Claude Desktop, providing one-click installation and configuration.

## What is a Desktop Extension?

Desktop Extensions (.mcpb files) are packaged MCP servers that can be installed directly into Claude Desktop without manual configuration. They provide:

- **One-click installation** - No manual editing of configuration files
- **User-friendly configuration** - Settings UI within Claude Desktop
- **Automatic updates** - Get notified when new versions are available
- **Bundled dependencies** - Everything needed is included in the package

## Installation

### Method 1: Download from GitHub Releases (Recommended)

1. Visit the [Memory Box MCP Releases page](https://github.com/amotivv/memory-box-mcp/releases)
2. Download the latest `memory-box.mcpb` file
3. Open Claude Desktop
4. Navigate to Settings → Extensions
5. Click "Install from file"
6. Select the downloaded `memory-box.mcpb` file
7. Configure your settings in the extension configuration panel

### Method 2: Build from Source

If you want to build the extension yourself:

```bash
# Clone the repository
git clone https://github.com/amotivv/memory-box-mcp.git
cd memory-box-mcp

# Install dependencies
npm install

# Build the extension
npm run build-extension

# The extension will be at dist/memory-box.mcpb
```

## Configuration

After installation, you'll need to configure the extension:

### Required Settings

1. **API Token**
   - Get your Memory Box toekn
   - This authenticates your requests to the Memory Box API

### Optional Settings

1. **Memory Box API URL**
   - Default: `https://memorybox.amotivv.ai`
   - Change this if you're using a self-hosted Memory Box instance

2. **Default Bucket**
   - Default: `General`
   - The bucket where memories are saved by default

3. **System Prompt**
   - Leave empty to use the default formatting prompt
   - Customize to change how memories are formatted

## Using the Extension

Once installed and configured, you can use all Memory Box tools directly in Claude:

### Basic Usage

```
Save this memory: "Vector databases store embeddings for semantic search"
```

Claude will automatically use the Memory Box tools to save and retrieve your memories.

### Available Tools

The extension provides all Memory Box tools:

- `save_memory` - Save formatted memories
- `search_memories` - Search using semantic similarity
- `get_all_memories` - Retrieve all memories
- `get_bucket_memories` - Get memories from a specific bucket
- `get_buckets` - List all buckets
- `create_bucket` - Create new buckets
- `delete_bucket` - Delete buckets
- `update_memory` - Update existing memories
- `delete_memory` - Delete memories
- `get_related_memories` - Find similar memories
- `check_memory_status` - Check processing status
- `format_memory` - Format text without saving
- `get_usage_stats` - View usage statistics

## Troubleshooting

### Extension Not Working

1. **Check API Token**
   - Ensure your token is correctly entered in settings
   - Verify the token is active in your Memory Box dashboard

2. **Check API URL**
   - Default URL should work for most users
   - Self-hosted users need to update this

3. **Restart Claude Desktop**
   - Some changes require a restart to take effect

### Common Issues

**"Authentication failed" error**
- Your API token may be incorrect or expired
- Get a new token from the Memory Box dashboard

**"Cannot connect to Memory Box" error**
- Check your internet connection
- Verify the API URL is correct
- Ensure Memory Box service is operational

**Tools not appearing**
- Restart Claude Desktop
- Reinstall the extension
- Check the extension is enabled in settings

### Getting Help

- [GitHub Issues](https://github.com/amotivv/memory-box-mcp/issues)

## Updating the Extension

When a new version is available:

1. Download the latest `memory-box.mcpb` from releases
2. In Claude Desktop, go to Settings → Extensions
3. Uninstall the current version
4. Install the new version
5. Your settings will be preserved

## Privacy and Security

- **Local Processing**: The extension runs locally on your machine
- **Secure Communication**: All API calls use HTTPS
- **Token Security**: Your API token is stored securely by Claude Desktop
- **No Telemetry**: The extension doesn't collect usage data

## Advanced Configuration

### Custom System Prompts

You can customize how memories are formatted by providing a custom system prompt:

1. In the extension settings, expand "Advanced Settings"
2. Enter your custom prompt in the "System Prompt" field
3. Save settings and restart Claude Desktop

Example custom prompt:
```
When saving memories, always include:
1. A clear title
2. Key concepts as bullet points
3. Related topics for cross-referencing
```

### Self-Hosted Memory Box

If you're running your own Memory Box instance:

1. Update the API URL to your instance endpoint
2. Ensure your instance is accessible from your machine
3. Use tokens generated by your instance

## Development

### Extension Structure

```
memory-box.mcpb
├── manifest.json      # Extension metadata and configuration
├── icon.png          # Extension icon
└── server/           # MCP server files
    ├── index.js      # Main server entry point
    ├── package.json  # Dependencies
    └── node_modules/ # Bundled dependencies
```

### Building Custom Versions

To create a custom build:

1. Modify the source code as needed
2. Update `manifest.json` with your changes
3. Run `npm run build-extension`
4. Test the generated `.mcpb` file

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This extension is released under the MIT License. See [LICENSE](LICENSE) for details.
