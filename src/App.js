import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import Ticket from './components/Ticket';
import Waiter from './components/Waiter';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
