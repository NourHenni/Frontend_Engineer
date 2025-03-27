import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Navbar from './components/navbar/Navbar';
import SidebarLayout from './components/sidebar/Sidebar';
import FormModal from './components/modals/FormModal';
import TableData from './components/table/TableData';
import ButtonModel from './components/button/Button';

// import { Sidebar } from './components/layouts/sidebar/Sidebar';

function App() {
  return (
    <>
      <Navbar />
      <ButtonModel />
      <SidebarLayout />
      <FormModal />
        <TableData />
      
    </>
  );
}

export default App;
