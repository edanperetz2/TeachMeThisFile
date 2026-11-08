// Every piece of interface text, in English and Hebrew. Texts with values are functions.
// The lesson itself is written by the tutor in the language the teacher asked for;
// this only covers the app around it.

export const LANGUAGES = {
  en: { label: 'EN', name: 'English', dir: 'ltr' },
  he: { label: 'עב', name: 'עברית', dir: 'rtl' },
}

const en = {
  languageSwitch: 'Interface language',

  headline: 'Turn any file into a lesson',
  intro:
    'Upload your material and say how it should be taught. A patient AI tutor teaches it one step at a time, checks understanding and stays true to your file.',
  howItWorks: ['Upload a file', 'Say how to teach it', 'Learn it step by step'],
  fileCard: 'Your file',
  promptCard: 'How should it be taught?',
  keyCard: 'Your Gemini API key',
  promptPlaceholder: 'Who is the student, which language, what style, how long…',
  examplesLabel: 'Or start from an example:',
  presets: [
    { label: '7th grade · French · Socratic', prompt: 'Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes.' },
    { label: 'Simple, for 10-year-olds', prompt: 'Explain this simply for 10-year-olds, with everyday examples. About 10 minutes.' },
    { label: 'Exam revision', prompt: 'Help a high-school student revise this for an exam: short explanations and lots of quick questions. 15 minutes.' },
    { label: 'בעברית', prompt: 'למדו את החומר לתלמידי כיתה ח׳, בעברית, צעד אחר צעד. בערך 15 דקות.' },
  ],
  start: 'Start the lesson',
  tryAgain: 'Try again',
  missing: { file: 'a file', prompt: 'how to teach it', key: 'your API key' },
  addToStart: (items) => `Add ${items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]} to start.`,
  privacyNote: 'Your file is read in your browser. Your key stays in this tab.',
  readingFile: 'Reading your file',
  readingScans: (done, total) => `Reading scanned pages (${done} of ${total} done)`,
  planning: 'Planning the lesson',
  meetingTutor: 'Meeting your tutor',

  chooseFile: 'Choose a file',
  orDrop: 'or drop it here',
  fileFormats: (mb) => `PDF (also scanned), Word, text or a photo · up to ${mb} MB`,
  changeFile: 'Change',
  fileProblems: {
    unsupported: "This file type isn't supported. Use a PDF, Word (.docx), text or image file.",
    empty: 'This file is empty.',
    tooLarge: (mb) => `This file is larger than ${mb} MB. Try a smaller file or split it into parts.`,
  },

  keyLabel: 'Gemini API key',
  keyPlaceholder: 'Paste your key here',
  show: 'Show',
  hide: 'Hide',
  keySaved: 'Saved for this tab.',
  keyNote: "Sent only to this app's server, never stored there.",
  getKey: 'Get a free key',

  stepOf: (n, total) => `Step ${n} of ${total}`,
  lessonComplete: 'Lesson complete',
  newLesson: 'New lesson',
  showPlan: 'Plan',
  hidePlan: 'Hide plan',
  stepStatus: { done: 'done', active: 'current', pending: 'not started yet' },
  stepDivider: (n, title) => `Step ${n} · ${title}`,
  source: 'Source',
  sourcePages: (pages) => `Source · p. ${pages}`,
  replyStopped: 'Reply stopped',
  stopped: 'Stopped',
  thinking: 'Tutor is thinking…',
  answerPlaceholder: 'Type your answer…',
  answerLabel: 'Your answer',
  send: 'Send',
  stop: 'Stop',
  quickReplies: ["I don't know", 'Give me a hint', 'Explain it differently'],
  retry: 'Retry',
  skippedPages: (pages) => `Some scanned pages couldn't be read and are not part of this lesson: page ${pages}.`,
  leaveConfirm: 'Leave this lesson? Your progress will be lost.',

  fromYourFile: 'From your file',
  close: 'Close',
  page: (n) => `Page ${n}`,
  passage: 'Passage',

  reportSummary: (steps, minutes) => `All ${steps} steps done${minutes === null ? '' : ` in about ${minutes} min`}. Nice work!`,
  answers: (n) => (n === 1 ? '1 answer' : `${n} answers`),
  minutes: (n) => `${n} min`,
  understood: { yes: 'Understood', partial: 'Partly', no: 'Not yet' },
  copySummary: 'Copy summary for the teacher',
  copied: 'Copied',
  startNewLesson: 'Start a new lesson',
  summaryLesson: 'Lesson',
  summaryFile: 'File',

  // English shows the server's own, more specific message; no table needed.
  errors: {},
}

const he = {
  languageSwitch: 'שפת הממשק',

  headline: 'הופכים כל קובץ לשיעור',
  intro:
    'העלו את חומר הלימוד וכתבו איך ללמד אותו. מורה AI סבלני ילמד אותו צעד אחר צעד, יבדוק הבנה ויישאר נאמן לקובץ שלכם.',
  howItWorks: ['מעלים קובץ', 'כותבים איך ללמד', 'לומדים צעד אחר צעד'],
  fileCard: 'הקובץ שלכם',
  promptCard: 'איך ללמד את החומר?',
  keyCard: 'מפתח ה-API של Gemini',
  promptPlaceholder: 'מי התלמיד, באיזו שפה, באיזה סגנון, כמה זמן…',
  examplesLabel: 'או התחילו מדוגמה:',
  presets: [
    { label: 'כיתה ח׳ · בעברית · סוקרטי', prompt: 'למדו את החומר לתלמידי כיתה ח׳, בעברית, בשיטה סוקרטית. עד 15 דקות.' },
    { label: 'פשוט, לגילאי 10', prompt: 'הסבירו את החומר בפשטות לילדים בני 10, עם דוגמאות מחיי היום-יום. בערך 10 דקות.' },
    { label: 'חזרה למבחן', prompt: 'עזרו לתלמיד תיכון לחזור על החומר לקראת מבחן: הסברים קצרים והרבה שאלות קצרות. 15 דקות.' },
    { label: 'In English', prompt: 'Teach this to 7th graders, in English. Be Socratic. Keep it under 15 minutes.' },
  ],
  start: 'התחילו את השיעור',
  tryAgain: 'נסו שוב',
  missing: { file: 'קובץ', prompt: 'הנחיה ללימוד', key: 'מפתח API' },
  addToStart: (items) =>
    `כדי להתחיל, הוסיפו ${items.length > 1 ? `${items.slice(0, -1).join(', ')} ו${items.at(-1)}` : items[0]}.`,
  privacyNote: 'הקובץ נקרא בדפדפן שלכם. המפתח נשאר בלשונית הזו.',
  readingFile: 'קוראים את הקובץ',
  readingScans: (done, total) => `קוראים עמודים סרוקים (${done} מתוך ${total})`,
  planning: 'מתכננים את השיעור',
  meetingTutor: 'פוגשים את המורה',

  chooseFile: 'בחרו קובץ',
  orDrop: 'או גררו אותו לכאן',
  fileFormats: (mb) => `PDF (גם סרוק), Word, טקסט או תמונה · עד ${mb} MB`,
  changeFile: 'החלפה',
  fileProblems: {
    unsupported: 'סוג הקובץ הזה לא נתמך. השתמשו בקובץ PDF, ‏Word ‏(docx), טקסט או תמונה.',
    empty: 'הקובץ ריק.',
    tooLarge: (mb) => `הקובץ גדול מ-${mb} MB. נסו קובץ קטן יותר או פצלו אותו לחלקים.`,
  },

  keyLabel: 'מפתח API של Gemini',
  keyPlaceholder: 'הדביקו כאן את המפתח',
  show: 'הצג',
  hide: 'הסתר',
  keySaved: 'נשמר ללשונית הזו.',
  keyNote: 'נשלח רק לשרת של האפליקציה ולא נשמר בו.',
  getKey: 'קבלו מפתח בחינם',

  stepOf: (n, total) => `שלב ${n} מתוך ${total}`,
  lessonComplete: 'השיעור הושלם',
  newLesson: 'שיעור חדש',
  showPlan: 'תוכנית',
  hidePlan: 'הסתר תוכנית',
  stepStatus: { done: 'הושלם', active: 'שלב נוכחי', pending: 'טרם התחיל' },
  stepDivider: (n, title) => `שלב ${n} · ${title}`,
  source: 'מקור',
  sourcePages: (pages) => `מקור · עמ׳ ${pages}`,
  replyStopped: 'התשובה נעצרה',
  stopped: 'נעצר',
  thinking: 'המורה חושב…',
  answerPlaceholder: 'כתבו את התשובה שלכם…',
  answerLabel: 'התשובה שלכם',
  send: 'שליחה',
  stop: 'עצירה',
  quickReplies: ['לא יודע/ת', 'אפשר רמז?', 'אפשר הסבר אחר?'],
  retry: 'נסו שוב',
  skippedPages: (pages) => `חלק מהעמודים הסרוקים לא נקראו ואינם חלק מהשיעור: עמוד ${pages}.`,
  leaveConfirm: 'לצאת מהשיעור? ההתקדמות תאבד.',

  fromYourFile: 'מתוך הקובץ שלכם',
  close: 'סגירה',
  page: (n) => `עמוד ${n}`,
  passage: 'קטע',

  reportSummary: (steps, minutes) => `כל ${steps} השלבים הושלמו${minutes === null ? '' : ` בתוך כ-${minutes} דקות`}. כל הכבוד!`,
  answers: (n) => (n === 1 ? 'תשובה אחת' : `${n} תשובות`),
  minutes: (n) => `${n} דק׳`,
  understood: { yes: 'הובן', partial: 'הובן חלקית', no: 'טרם הובן' },
  copySummary: 'העתקת סיכום למורה',
  copied: 'הועתק',
  startNewLesson: 'שיעור חדש',
  summaryLesson: 'שיעור',
  summaryFile: 'קובץ',

  // Translated by error code (the server's messages are in English).
  errors: {
    INVALID_KEY: 'מפתח ה-API לא התקבל. בדקו אותו ונסו שוב.',
    RATE_LIMITED: 'יש כרגע יותר מדי בקשות ל-AI. חכו רגע ונסו שוב.',
    QUOTA_EXCEEDED: 'המפתח הזה ניצל את מכסת הבקשות החינמיות להיום. נסו שוב מחר או השתמשו במפתח אחר.',
    TIMEOUT: 'ה-AI לא ענה בזמן. נסו שוב.',
    TOO_LARGE: 'הקובץ גדול מדי לשליחה. נסו קובץ קטן יותר או פצלו אותו.',
    UPSTREAM: 'שירות ה-AI נתקל בבעיה. נסו שוב בעוד רגע.',
    NETWORK: 'לא הצלחנו להתחבר לשרת. בדקו את החיבור ונסו שוב.',
    NO_TEXT: 'לא מצאנו טקסט בקובץ הזה.',
    UNREADABLE: 'לא הצלחנו לקרוא את הקובץ. ייתכן שהוא פגום, מוגן בסיסמה או שאינו קובץ טקסט.',
    BAD_REQUEST: 'משהו השתבש בבקשה. נסו שוב.',
    UNEXPECTED: 'משהו השתבש. נסו שוב.',
  },
}

export const STRINGS = { en, he }

// The text to show for an error { code, message } in the chosen language.
export function errorText(t, error) {
  return t.errors[error.code] ?? error.message
}
