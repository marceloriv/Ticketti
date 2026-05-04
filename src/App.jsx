import './App.css';
import Inicio from '@pages/Inicio';
import Login from '@pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
    </Routes>

    </BrowserRouter>
  )
}

export default App;
