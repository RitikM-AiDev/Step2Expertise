import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './index.css'
import Login from './Login.tsx'
import App from './App.tsx'
import Registeration from './Registration.tsx'
import OTPPage from './Otp.tsx'
 const route = createBrowserRouter([
    {
      path : "/home",
      element : <App/>
    },
    {
      path : "/",
      element : <Registeration/>
    },
    {
        path : "/login",
        element : <Login/>
    },
    {
      path : "/otppage",
      element : <OTPPage/>
    }
  ]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <RouterProvider router={route}/> 
  </StrictMode>
)
