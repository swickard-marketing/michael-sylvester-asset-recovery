#!/usr/bin/env python3
"""
Fix escaped newlines in Apps Script
Replace \\n with \n for proper line breaks in dialogs
"""

file_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\google_apps_script_per_dealer.gs'

# Read file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Count replacements
count = content.count('\\\\n')

# Replace double backslash-n with single backslash-n
# In Python strings: '\\n' is a literal \n, '\\\\n' is \\n
content = content.replace('\\\\n', '\\n')

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {count} instances of escaped newlines (\\\\n -> \\n)")
print("Dialogs will now show proper line breaks instead of \\n text")
