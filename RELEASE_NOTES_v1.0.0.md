# Memory Box MCP v1.0.0 Release Notes

## 🎉 Major Release: Desktop Extension Support

### ✨ New Features

#### Desktop Extension (.dxt)
- One-click installation for Claude Desktop users
- No manual configuration required
- User-friendly settings interface for API token and configuration
- Automatic updates support

#### New Memory Management Tools
- `create_bucket` - Create new buckets for organizing memories
- `delete_bucket` - Delete buckets (with force option for non-empty buckets)
- `update_memory` - Update existing memories (text, bucket, relationships)
- `delete_memory` - Delete specific memories

#### Enhanced Search
- Pagination support (limit and offset parameters)
- Date sorting (newest/oldest first)
- Improved semantic search performance

### 🔧 Improvements

#### System Prompt
- More accessible and user-friendly memory formatting
- Simplified structure with clear examples
- Better suited for general Claude Desktop users

#### Security
- Fixed critical vulnerability in form-data package
- Fixed high severity vulnerability in axios package
- All dependencies updated to secure versions

### 📦 Installation

#### Desktop Extension (Recommended)
1. Download `memory-box.dxt` from the releases page
2. Open Claude Desktop
3. Go to Settings → Extensions
4. Click "Install from file" and select the .dxt file
5. Enter your Memory Box API token
6. Start using Memory Box immediately!

#### Manual Installation
Still supported via npm or direct configuration as before.

### 🐛 Known Issues
- Pagination offset parameter may not work as expected in some cases

### 📝 Breaking Changes
None - all existing functionality remains compatible.

### 🙏 Acknowledgments
Thanks to all users who provided feedback and tested the new features!
