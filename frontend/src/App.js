// src/App.js
import './CSS/App.css';
import FooterComp from './Components/FooterComp';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginComp from './Components/LoginComp';
import Navigation from './Components/Navigation';
import SignUpComp from './Components/SignUpComp';
import CreateBike from './Components/CreateBikeComp';
import UploadImages from './Components/UploadImagesComp';
import HomeComp from './Components/HomeComp';
import BikeDetails from './Components/BikeDetails';

function App() {
  return (
    <div>
      <Navigation />

      <Routes>
        {/* Home route for "/" */}
        <Route path="/" element={<HomeComp />} />

        {/* other pages */}
        <Route path="/login" element={<LoginComp />} />
        <Route path="/signup" element={<SignUpComp />} />
        <Route path="/addbike" element={<CreateBike />} />
        <Route path="/upload/:bikeId" element={<UploadImages />} />
        <Route path="/bikes/:id" element={<BikeDetails />} />
        {/* catch-all: redirect unknown URLs to home (optional) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FooterComp />
    </div>
  );
}

export default App;
