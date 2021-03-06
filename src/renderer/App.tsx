import { MantineProvider } from '@mantine/core';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppContextProvider } from './context/AppContext';
import MainView from './views/MainView';

export default function App(){
  return (
    <AppContextProvider>
      <MantineProvider theme={{ colorScheme: 'dark' }}>
        <Router>
          <Routes>
            <Route path="/" element={<MainView />} />
          </Routes>
        </Router>
      </MantineProvider>
    </AppContextProvider>
  );
}
