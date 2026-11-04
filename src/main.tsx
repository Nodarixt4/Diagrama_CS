import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import '@xyflow/react/dist/style.css';
import './styles/global.css';
import './styles/tokens.css';
import './styles/tech.css';
import './styles/journey.css';
import './styles/refinement.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);