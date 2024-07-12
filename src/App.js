import logo from './logo.svg';
import { ThemeProvider } from "@mui/material/styles";
import './App.css';
import ChatPage from './pages/chatPage';
import { theme } from './theme';


function App() {
  return (
    <ThemeProvider theme={theme} >
      <ChatPage />
    </ThemeProvider>
  );
}

export default App;
