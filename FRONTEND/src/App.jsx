import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { LoginScreen } from './Screens/LoginScreen/LoginScreen.jsx'
import { RegisterScreen } from './Screens/RegisterScreen/RegisterScreen.jsx'
import { HomeScreen } from './Screens/HomeScreen/HomeScreen.jsx'
import { ProfileSetupScreen } from './Screens/ProfileSetupScreen/ProfileSetupScreen.jsx'
import { ProfileScreen } from './Screens/ProfileScreen/ProfileScreen.jsx'
import { ForgotPasswordScreen } from './Screens/ForgotPasswordScreen/ForgotPasswordScreen.jsx'
import { ResetPasswordScreen } from './Screens/ResetPasswordScreen/ResetPasswordScreen.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import AuthMiddleware from './middlewares/AuthMiddleware.jsx'
import AlreadyAuthMiddleware from './middlewares/AlreadyAuthMiddleware.jsx'
import { MainLayout } from './components/layout/MainLayout/MainLayout.jsx'
import { MessagesScreen } from './Screens/MessagesScreen/MessagesScreen.jsx'


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
            path='/forgot-password'
            element={<ForgotPasswordScreen />}
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
            <Route path='/messages' element={<MessagesScreen />} />
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