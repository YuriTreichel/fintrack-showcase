import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardView } from './views/DashboardView';

const App = () => {
    return (
        <main className="min-h-screen bg-slate-950">
            <DashboardView />
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

