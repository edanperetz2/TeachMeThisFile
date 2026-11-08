import { lazy, Suspense } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Spinner from './components/Spinner.jsx'
import { LanguageContext, useLanguageSetting } from './i18n/language.js'
import { languageQuestion } from './lesson/selectors.js'
import { useLesson } from './lesson/useLesson.js'
import { useApiKey } from './settings/useApiKey.js'

// The lesson screen (markdown + formula rendering) is loaded only when a lesson starts.
const LessonScreen = lazy(() => import('./components/LessonScreen.jsx'))

export default function App() {
  const [language, setLanguage] = useLanguageSetting()
  const [apiKey, setApiKey] = useApiKey()
  const { lesson, startLesson, chooseLanguage, sendMessage, stopTurn, retryTurn, newLesson } = useLesson(apiKey)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {lesson.plan ? (
        <Suspense
          fallback={
            <div className="grid h-dvh place-items-center text-indigo-600">
              <Spinner className="size-8" />
            </div>
          }
        >
          <LessonScreen
            lesson={lesson}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onSend={sendMessage}
            onStop={stopTurn}
            onRetry={retryTurn}
            onNewLesson={newLesson}
          />
        </Suspense>
      ) : (
        <SetupScreen
          status={lesson.status}
          error={lesson.error}
          scanProgress={lesson.scanProgress}
          lastPrompt={lesson.teacherPrompt}
          languageOptions={lesson.pendingPlan && languageQuestion(lesson.pendingPlan)}
          onChooseLanguage={chooseLanguage}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onStart={startLesson}
        />
      )}
    </LanguageContext.Provider>
  )
}
