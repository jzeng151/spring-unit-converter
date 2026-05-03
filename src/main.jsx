import { createRoot } from 'react-dom/client';
import { Converter } from './converter.jsx';
import './animations.css';

createRoot(document.getElementById('app')).render(<Converter />);
