# Changelog

All notable changes to the Memory Box MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-09-20

### Changed
- **Desktop Extension Format Update**:
  - Updated from `.dxt` to `.mcpb` file extension following Anthropic's naming convention change
  - Updated manifest format to use `manifest_version: "0.2"` per latest MCPB specification
  - All functionality remains the same - this is purely a format update for compatibility

- **Documentation Updates**:
  - Updated README.md to reference `.mcpb` files instead of `.dxt`
  - Updated DESKTOP_EXTENSION.md with new file extension and installation instructions
  - Updated build scripts to generate `.mcpb` archives

### Fixed
- Resolved "Invalid manifest. Unrecognized keys in object" errors in Claude Desktop
- Fixed compatibility with latest Claude Desktop extension loading system

## [1.0.0] - 2025-07-31

### Added
- **New Tools**:
  - `create_bucket` - Create new buckets for organizing memories
  - `delete_bucket` - Delete buckets with optional force deletion
  - `update_memory` - Update existing memories including text, bucket, and relationships
  - `delete_memory` - Delete specific memories
  
- **API Enhancements**:
  - Pagination support for memory retrieval (limit and offset parameters)
  - Date sorting for semantic search results (date_sort and sort_order parameters)
  - Enhanced reference data support for explicit relationship management
  - Support for context.related_memories array in reference data

- **Desktop Extension Support**:
  - Prepared for packaging as Claude Desktop Extension (.dxt)
  - Added manifest configuration for one-click installation
  - Environment variable mapping for user configuration

### Changed
- Updated version from 0.1.0 to 1.0.0 (major release)
- Enhanced `searchMemories` method to support pagination and date sorting
- Improved error messages for better debugging
- Updated package description for clarity

### Fixed
- Improved error handling for all API methods
- Better type safety for memory IDs (accepts both number and string)

## [0.1.0] - 2025-03-03

### Initial Release
- Basic MCP server implementation
- Core tools:
  - `save_memory` - Save memories with formatting
  - `search_memories` - Semantic search
  - `get_all_memories` - Retrieve all memories
  - `get_bucket_memories` - Get memories from specific bucket
  - `get_buckets` - List all buckets
  - `get_related_memories` - Find similar memories
  - `check_memory_status` - Check processing status
  - `format_memory` - Format text without saving
  - `get_usage_stats` - View usage statistics
- System prompt customization support
- Memory type formatting (TECHNICAL, DECISION, SOLUTION, etc.)
- Integration with Memory Box API v2
