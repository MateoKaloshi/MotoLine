import './App.css';
import FooterComp from './Components/FooterComp';
import { Routes, Route } from 'react-router-dom';
import LoginComp from './Components/LoginComp';
import Navigation from './Components/Navigation';

function App() {
  return (
    <div>
      <Navigation />
     <Routes>
      <Route path="/login" element={<LoginComp />} />
     </Routes>
      <FooterComp />
    </div>
  );
}

export default App;
