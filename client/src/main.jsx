import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Test from './pages/Test.jsx'
import Index from './pages/Index.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import About from './pages/About.jsx'
import Room from './pages/Room.jsx'
import './style.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index/>}></Route>
        <Route path="/home" element={<Home/>}></Route>
        <Route path="/test" element={<Test/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/account" element={<Account/>}></Route>
        <Route path="/about" element={<About/>}></Route>
        <Route path="/room" element={<Room/>}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
