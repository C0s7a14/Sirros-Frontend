import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/Login/LoginPage'
import { MagicLinkPage } from './pages/Login/MagicLinkPage'
import { HomePage } from './pages/Home/HomePage'
import { TrainingsPage } from './pages/Trainings/TrainingsPage'
import { TrainingPage } from './pages/Training/TrainingPage'
import { QuizPage } from './pages/Quiz/QuizPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/magic" element={<MagicLinkPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/trainings" element={<TrainingsPage />} />
              <Route path="/trainings/:id" element={<TrainingPage />} />
              <Route path="/quizzes/:id" element={<QuizPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
