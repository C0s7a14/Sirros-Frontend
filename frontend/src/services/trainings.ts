import api from '../lib/api'
import type { AskResponse, Training, TrainingDocument } from '../types'

export const trainingsService = {
  list: () => api.get<Training[]>('/trainings').then((r) => r.data),
  get: (id: string) => api.get<Training>(`/trainings/${id}`).then((r) => r.data),
  create: (data: { title: string; description: string }) =>
    api.post<Training>('/trainings', data).then((r) => r.data),
  uploadDocument: (trainingId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<TrainingDocument>(`/trainings/${trainingId}/documents`, form)
      .then((r) => r.data)
  },
  ask: (trainingId: string, question: string) =>
    api.post<AskResponse>(`/trainings/${trainingId}/ask`, { question }).then((r) => r.data),
}
