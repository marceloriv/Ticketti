import './App.css';
import Inicio from '@pages/Inicio';
import Login from '@pages/Login';
import Registro from '@pages/Registro';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </div>

    </BrowserRouter>
  )
}

export default App;
