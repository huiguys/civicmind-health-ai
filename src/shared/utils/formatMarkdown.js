/**
 * Format markdown text to HTML
 * Converts markdown syntax to HTML elements
 */
export const formatMarkdown = (text) => {
  if (!text) return text;
  
  // Convert ## headings to <h3>
  let formatted = text.replace(/^## (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h3>');
  
  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  
  // Convert *text* to <em>text</em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  
  // Convert bullet points
  formatted = formatted.replace(/^\* (.+)$/gm, '<li class="ml-4 mb-2">• $1</li>');
  
  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li class="ml-4 mb-2">.*<\/li>\n?)+/g, '<ul class="my-3">$&</ul>');
  
  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};
