function markdownToHtml(md) {
  if (!md) return ""
  var html = md

  // Code blocks with line numbers
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, _lang, code) {
    var lines = code.trim().split("\n")
    var codeHtml = lines.map(function(line, i) {
      var num = String(i + 1)
      return "<span class=\"code-line\"><span class=\"line-num\">" + num + "</span><span class=\"line-content\">" + escapeHtml(line) + "</span></span>"
    }).join("\n")
    return "<pre class=\"code-block\"><code>" + codeHtml + "</code></pre>"
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code class=\"inline-code\">$1</code>")

  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  // Blockquote
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

  // Unordered list
  html = html.replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href=\"$2\">$1</a>")

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img src=\"$2\" alt=\"$1\" />")

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>")

  // Paragraphs
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>")
  html = html.replace(/<p>\s*<\/p>/g, "")

  return html
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

module.exports = { markdownToHtml: markdownToHtml }