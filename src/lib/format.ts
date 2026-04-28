/**
 * Format a keyboard shortcut combo string for display.
 * Converts Tauri key names to macOS symbol equivalents.
 */
export function formatCombo(combo: string): string {
  return combo
    .replace(/CommandOrControl/g, '⌘')
    .replace(/Command/g, '⌘')
    .replace(/Control/g, '⌃')
    .replace(/Shift/g, '⇧')
    .replace(/Alt|Option/g, '⌥')
}
