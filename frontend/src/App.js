import './CSS/App.css';
import FooterComp from './Components/FooterComp';
import { Routes, Route } from 'react-router-dom';
import LoginComp from './Components/LoginComp';
import Navigation from './Components/Navigation';
import SignUpComp from './Components/RegisterComp';

function App() {
  return (
    <div>
      <Navigation />
     <Routes>
      <Route path="/login" element={<LoginComp />} />
      <Route path="/register" element={<SignUpComp />} />
     </Routes>
      <FooterComp />
    </div>
  );
}

export default App;
