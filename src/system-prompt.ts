/**
 * Default system prompt template for Memory Box MCP Server
 * 
 * This template defines how memories are formatted when saved to Memory Box.
 * Users can customize this by setting the SYSTEM_PROMPT environment variable
 * in their Cline MCP settings.
 */

export const DEFAULT_SYSTEM_PROMPT = `
You are a helpful AI assistant. When storing memories with memory_plugin, follow these enhanced formatting guidelines:

1. CREATE FOCUSED MEMORIES: Each memory should contain a single clear concept or topic.

2. STRUCTURE: Use these formats depending on the type of information:
   - TECHNICAL: "YYYY-MM-DD: Technical - [Brief topic]: [Concise explanation with specific details]"
   - DECISION: "YYYY-MM-DD: Decision - [Brief topic]: [Decision made] because [rationale]. Alternatives considered: [options]."
   - SOLUTION: "YYYY-MM-DD: Solution - [Problem summary]: [Implementation details that solved the issue]"
   - CONCEPT: "YYYY-MM-DD: Concept - [Topic]: [Clear explanation of the concept with examples]"
   - REFERENCE: "YYYY-MM-DD: Reference - [Topic]: [URL, tool name, or resource] for [specific purpose]"
   - APPLICATION: "YYYY-MM-DD: Application - [App name]: [User-friendly description] followed by [technical implementation details]"

3. USE DIVERSE TERMINOLOGY: Include both technical terms AND user-friendly alternatives within the same memory. For example, "Created a memory app (self-hosted vector database system) for storing and retrieving semantic information (vectorized memories)."

4. INCLUDE SEARCHABLE KEYWORDS: Begin with common terms a user might search for. Consider synonyms and alternative phrasings for important concepts.

5. BALANCE DETAIL LEVELS: Include both high-level descriptions (what it does) and key technical details (how it works).

6. LENGTH: Keep memories between 50-150 words. Include enough context to be useful but avoid unnecessary details.

7. TEST RETRIEVABILITY: Before storing an important memory, consider: "What search terms might someone use to find this information later?" and ensure those terms are included.

When storing user facts, preferences, or personal details, use a simpler format:
"FACT: [User] [specific preference/attribute/information] as mentioned on [date]."

Always prioritize storing information that will be valuable for future retrieval.
`;

/**
 * Loads the system prompt from environment variables or uses the default
 * @returns The system prompt to use for memory formatting
 */
export function loadSystemPrompt(): string {
  return process.env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;
}

/**
 * Validates that a system prompt contains the necessary formatting guidelines
 * @param prompt The system prompt to validate
 * @returns True if the prompt is valid, false otherwise
 */
export function validateSystemPrompt(prompt: string): boolean {
  // Check for essential elements that should be in any valid system prompt
  const requiredElements = [
    "TECHNICAL", 
    "DECISION", 
    "SOLUTION", 
    "CONCEPT", 
    "REFERENCE", 
    "APPLICATION",
    "YYYY-MM-DD"
  ];
  
  const missingElements = requiredElements.filter(element => !prompt.includes(element));
  
  if (missingElements.length > 0) {
    console.error(`Warning: System prompt is missing required elements: ${missingElements.join(", ")}`);
    return false;
  }
  
  return true;
}
