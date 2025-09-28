import './CSS/App.css';
import FooterComp from './Components/FooterComp';
import { Routes, Route } from 'react-router-dom';
import LoginComp from './Components/LoginComp';
import Navigation from './Components/Navigation';
import SignUpComp from './Components/SignUpComp';
import CreateBike from './Components/CreateBikeComp';
import UploadImages from './Components/UploadImagesComp';

function App() {
  return (
    <div>
      <Navigation />
     <Routes>
      <Route path="/login" element={<LoginComp />} />
      <Route path="/signup" element={<SignUpComp />} />
      <Route path="/add-bike" element={<CreateBike />} />
       <Route path="/upload/:bikeId" element={<UploadImages />} />
     </Routes>
      <FooterComp />
    </div>
  );
}

export default App;
