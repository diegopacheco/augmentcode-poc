import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <img
              src="/logo-app.png"
              alt="Coaching App"
              className="logo"
            />
            <h1 className="app-title">Coaching App</h1>
          </div>
        </div>
      </header>
      <Navigation />
      <div className="container">
        {children}
      </div>
    </div>
  );
}
