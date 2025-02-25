import { useEffect } from 'react'
import { Button, Typography, Container } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import logger from './utils/logger'
import LoginPage from './pages/LoginPage'
import { restoreAuthState, selectIsAuthenticated } from './store/slices/authSlice'
import DashboardRouter from './components/DashboardRouter'

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    dispatch(restoreAuthState())
    logger.info('Auth state restored from localStorage')
  }, [dispatch])

  return isAuthenticated ? <DashboardRouter /> : <LoginPage />
}

export default App
