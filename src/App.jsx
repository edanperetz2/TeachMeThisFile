import SetupScreen from './components/SetupScreen.jsx'
import { useLesson } from './lesson/useLesson.js'
import { useApiKey } from './settings/useApiKey.js'

export default function App() {
  const [apiKey, setApiKey] = useApiKey()
  const { lesson, startLesson } = useLesson(apiKey)

  return (
    <SetupScreen
      status={lesson.status}
      error={lesson.error}
      apiKey={apiKey}
      onApiKeyChange={setApiKey}
      onStart={startLesson}
    />
  )
}
