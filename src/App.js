import logo from './logo.svg';
import './App.css';
import LoggedOutNavigation from './Components/NavigationBar/LoggedOutNavigation';
import FooterComp from './Components/Footer/FooterComp';

function App() {
  return (
    <div>
      <LoggedOutNavigation />
      <FooterComp />
    </div>
  );
}

export default App;
