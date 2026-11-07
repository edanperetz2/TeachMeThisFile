import { lazy, Suspense } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import Spinner from './components/Spinner.jsx'
import { useLesson } from './lesson/useLesson.js'
import { useApiKey } from './settings/useApiKey.js'

// The lesson screen (markdown + formula rendering) is loaded only when a lesson starts.
const LessonScreen = lazy(() => import('./components/LessonScreen.jsx'))

export default function App() {
  const [apiKey, setApiKey] = useApiKey()
  const { lesson, startLesson, sendMessage, stopTurn, retryTurn, newLesson } = useLesson(apiKey)

  if (!lesson.plan) {
    return (
      <SetupScreen
        status={lesson.status}
        error={lesson.error}
        scanProgress={lesson.scanProgress}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onStart={startLesson}
      />
    )
  }

  return (
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
  )
}
