# Test files

Small files used to check the app by hand against the kinds of material reviewers will try.

| File | What it checks |
|---|---|
| `hebrew-cells.pdf` | Right-to-left text, including an English term inside a Hebrew sentence |
| `formulas-and-table.pdf` | Formulas and a table in a PDF text layer |
| `long-history.pdf` | A 31-page document (61 passages), page numbers on sources |
| `planets-table.docx` | Word file with a table (becomes a markdown table) |
| `prompt-injection.txt` | A file that tells the AI to ignore its instructions |
| `blank-page.pdf` | A PDF with no text → "We couldn't find any text" |
| `garbage.txt` | Random bytes with a .txt name → "doesn't look like readable text" |
| `scanned-math-and-hebrew.pdf` | Two image-only pages (no text layer): a formula worksheet with a table, and a Hebrew page → read by Gemini (OCR) |
| `worksheet-photo.png` | A slightly rotated photo of the worksheet → image upload and OCR |
| `arabic-photosynthesis.pdf` | Arabic text with English terms and formulas inside sentences, e.g. (CO2), (chloroplasts) |
| `hebrew-windows-1255.txt` | A Hebrew text file in the old Windows encoding (not UTF-8) → read correctly, not as gibberish |
