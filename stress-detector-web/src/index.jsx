import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { UserProvider } from "./contexts/UserContext";

import './styles/style.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <UserProvider >
    <BrowserRouter>
        <App/>
    </BrowserRouter>
  </UserProvider>
)