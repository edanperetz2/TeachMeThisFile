import mammoth from 'mammoth'
import { AppError } from '../errors.js'

// mammoth turns the .docx into simple HTML; we turn that into plain text where
// paragraphs are separated by blank lines and tables become markdown tables.
export async function readDocxText(file) {
  let html
  try {
    html = (await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })).value
  } catch {
    throw new AppError('UNREADABLE', "We couldn't open this Word file. It may be damaged or not a .docx.")
  }
  const body = new DOMParser().parseFromString(html, 'text/html').body
  return [...body.children].map(blockText).join('\n\n')
}

function blockText(element) {
  if (element.tagName === 'TABLE') return tableToMarkdown(element)
  if (element.tagName === 'UL' || element.tagName === 'OL') {
    return [...element.querySelectorAll('li')].map((li) => `- ${li.textContent.trim()}`).join('\n')
  }
  return element.textContent.trim()
}

function tableToMarkdown(table) {
  const rows = [...table.querySelectorAll('tr')].map((tr) =>
    [...tr.children].map((cell) => cell.textContent.trim().replace(/\|/g, '\\|').replace(/\s+/g, ' ')),
  )
  if (rows.length === 0) return ''
  const line = (cells) => `| ${cells.join(' | ')} |`
  const divider = line(rows[0].map(() => '---'))
  return [line(rows[0]), divider, ...rows.slice(1).map(line)].join('\n')
}
