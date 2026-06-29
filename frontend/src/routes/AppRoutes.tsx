import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from '../pages/ChatPage'
import FavoritesPage from '../pages/FavoritesPage'
import HistoryPage from '../pages/HistoryPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import ProfilePage from '../pages/ProfilePage'
import PublishProductPage from '../pages/PublishProductPage'
import RegisterPage from '../pages/RegisterPage'
import StartPage from '../pages/StartPage'
import { paths } from './paths'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.home} element={<HomePage />} />
      <Route path={paths.gallery} element={<StartPage />} />
      <Route path="/producto/:id" element={<ProductDetailPage />} />
      <Route path="/home" element={<Navigate to={paths.home} replace />} />
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path={paths.publish} element={<PublishProductPage />} />
      <Route path={paths.history} element={<HistoryPage />} />
      <Route path={paths.favorites} element={<FavoritesPage />} />
      <Route path={paths.profile} element={<ProfilePage />} />
      <Route path={paths.chat} element={<ChatPage />} />
    </Routes>
  )
}
