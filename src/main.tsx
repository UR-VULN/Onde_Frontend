import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'pretendard/dist/web/static/pretendard.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'
import App from '@/App'
import { restoreSessionFromCookies } from '@/utils/authCookies'

restoreSessionFromCookies()


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
