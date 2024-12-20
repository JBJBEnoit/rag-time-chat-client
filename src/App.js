
import './App.css';
import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/chatPage';
import LibraryAdmin from './pages/libraryAdmin';

function App() {
  return (
    <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/library-admin" element={<LibraryAdmin />} />
    </Routes>
  );
}

export default App;
