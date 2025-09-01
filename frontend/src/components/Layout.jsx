import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './custom/Header';
import MobileNavigation from './ui/MobileNavigation';


const Layout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  );
};

export default Layout;
