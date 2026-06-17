import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LessonPage from './pages/LessonPage'
import SceneEditor from './pages/SceneEditor'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="/editor/:lessonId" element={<SceneEditor />} />
    </Routes>
  )
}

export default App
