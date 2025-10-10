import "./CSS/App.css";
import FooterComp from "./Components/FooterComp";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginComp from "./Components/LoginComp";
import Navigation from "./Components/Navigation";
import SignUpComp from "./Components/SignUpComp";
import CreateBike from "./Components/CreateBikeComp";
import UploadImages from "./Components/UploadImagesComp";
import HomeComp from "./Components/HomeComp";
import BikeDetails from "./Components/BikeDetails";
import MyBikesComp from "./Components/MyBikesComp";
import BrandBikes from "./Components/BrandBikes";
import SearchResultsPage from "./Components/SearchResultsPage";
import SettingsPageComp from "./Components/SettingPageComp";
import ChangeEmailComp from "./Components/ChangeEmailComp";
import ChangePasswordComp from "./Components/ChangePasswordComp";
import UpdateProfileComp from "./Components/UpdateProfileComp";
import UserProfileComp from "./Components/UserProfileComp";
import SaveContactComp from "./Components/SaveContactComp";
import AboutUsComp from "./Components/AboutUsComp";
import PrivacyPolicyComp from "./Components/PrivacyPolicyComp";

function App() {
  return (
    <div>
      <Navigation />

      <Routes>
        {/* HOME PAGE ROUTE */}
        <Route path="/" element={<HomeComp />} />

        {/* OTHER PAGES */}
        <Route path="/login" element={<LoginComp />} />
        <Route path="/signup" element={<SignUpComp />} />
        <Route path="/addbike" element={<CreateBike />} />
        <Route path="/upload/:bikeId" element={<UploadImages />} />
        <Route path="/bikes/:id" element={<BikeDetails />} />
        <Route path="/my-bikes" element={<MyBikesComp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/bikes/brand/:brand" element={<BrandBikes />} />
        <Route path="/search/:query" element={<SearchResultsPage />} />
        <Route path="/settings" element={<SettingsPageComp />} />
        <Route path="/settings/change-email" element={<ChangeEmailComp />} />
        <Route
          path="/settings/change-password"
          element={<ChangePasswordComp />}
        />
        <Route
          path="/settings/update-profile"
          element={<UpdateProfileComp />}
        />
        <Route path="/user/profile" element={<UserProfileComp />} />
        <Route path="/contact" element={<SaveContactComp />} />
        <Route path="/about-us" element={<AboutUsComp />} />
        <Route path="/privacypolicy" element={<PrivacyPolicyComp />} />
      </Routes>

      <FooterComp />
    </div>
  );
}

export default App;
