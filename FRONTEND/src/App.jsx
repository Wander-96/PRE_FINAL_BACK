import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { LoginScreen } from './Screens/LoginScreen/LoginScreen'
import { RegisterScreen } from './Screens/RegisterScreen/RegisterScreen'
import { HomeScreen } from './Screens/HomeScreen/HomeScreen'
import { ProfileSetupScreen } from './Screens/ProfileSetupScreen/ProfileSetupScreen'
import { ProfileScreen } from './Screens/ProfileScreen/ProfileScreen'
import { ResetPasswordScreen } from './Screens/ResetPasswordScreen/ResetPasswordScreen'
import { AuthContextProvider } from './context/AuthContext'
import AuthMiddleware from './middlewares/AuthMiddleware'
import AlreadyAuthMiddleware from './middlewares/AlreadyAuthMiddleware'
import { MainLayout } from './components/layout/MainLayout/MainLayout'


const App = () => {
  return (
    <AuthContextProvider>
      <Routes>

        <Route element={<AlreadyAuthMiddleware />}>
          <Route
            path='/login'
            element={<LoginScreen />}
          />
          <Route
            path='/register'
            element={<RegisterScreen />}
          />
          <Route
            path='/reset-password'
            element={<ResetPasswordScreen />}
          />
          <Route
            path='/'
            element={<LoginScreen />}
          />
        </Route>

        <Route
          element={<AuthMiddleware />}
        >
          <Route
            path='/setup-profile'
            element={<ProfileSetupScreen />}
          />
          <Route element={<MainLayout />}>
            <Route
              path='/home'
              element={<HomeScreen />}
            />
            {/* Rutas futuras protegidas irán aquí para que compartan el Sidebar */}
            <Route path='/projects' element={<h2>Projects (En construcción)</h2>} />
            <Route path='/search' element={<h2>Search (En construcción)</h2>} />
            
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/profile/:userId' element={<ProfileScreen />} />
          </Route>
        </Route>

        <Route
          path='/*'
          element={<Navigate to={'/home'} />}
        />

      </Routes>
    </AuthContextProvider>
  )
}

export default App