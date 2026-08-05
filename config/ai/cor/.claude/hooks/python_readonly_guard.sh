#!/bin/bash
# Auto-allows python3 Bash calls only when no write/delete pattern is detected in the command text.
# Anything else falls through to the normal permission prompt (fail-closed).
cmd=$(jq -r '.tool_input.command // empty')

if echo "$cmd" | grep -qE "\.write\(|json\.dump\(|open\([^)]*['\"][wax]|os\.(remove|unlink|rename)|shutil\.(rmtree|move|copy)|subprocess\.|sed -i|>>|> [^&]|(^|[; ])(rm|mv|cp) "; then
  exit 0
fi

echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"read-only python3 command (no write pattern detected)"}}'
