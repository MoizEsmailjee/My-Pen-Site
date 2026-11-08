import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {installGlobalAssetInterceptor} from './utils/assetResolver';

installGlobalAssetInterceptor();

createRoot(document.getElementById('root')!).render(<App />);
