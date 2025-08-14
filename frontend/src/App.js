import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import Chatpage from './Pages/Chatpage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  return userInfo ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/chats' element={
          <ProtectedRoute>
            <Chatpage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
 