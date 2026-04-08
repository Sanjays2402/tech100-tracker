import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StockPage from './pages/StockPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:symbol" element={<StockPage />} />
      </Routes>
    </BrowserRouter>
  )
}
