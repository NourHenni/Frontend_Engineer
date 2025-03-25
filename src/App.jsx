import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Navbar } from './components/layouts/navbar/Navbar'
import { SidebarLayout } from './components/layouts/sidebar/Sidebar'
//import { Sidebar } from './components/layouts/sidebar/Sidebar'
function App() {
 
  return (
    
      <div>
       <Navbar /> 
       <SidebarLayout />
      </div>
      
   
  )
}

export default App
