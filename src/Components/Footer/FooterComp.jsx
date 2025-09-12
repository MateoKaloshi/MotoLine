import React from 'react'
import '../../CSS/FooterStyle.css'
import logo from '../../Images/Footer/footerlogo.png'
import fb from '../../Images/Footer/facebook.png'
import ig from '../../Images/Footer/instagram.png'
import wp from '../../Images/Footer/whatsapp.png'

const FooterComp = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3" style={{ position: 'fixed', bottom: '0', width: '100%',}}>
        <div className="container">
          <div className="row gy-4">
            

            <div className="footer_info-style col-12 col-md-6 col-lg-3 text-center">
              <img
                src={logo}
                alt="MotoLine Logo"
                className="mb-3"
                style={{ maxWidth: "250px" }}
              />
              <p>
                <strong className="footer_topTextStyle">OUR LOCATION</strong>
                <br /> Rr. Myslym Shyri, Tirane, Albania
              </p>
              <p>
                <strong className="footer_topTextStyle">PHONE NUMBER</strong>
                <br /> +355 456 7890
              </p>
              <p>
                <strong className="footer_topTextStyle">EMAIL ADDRESS</strong>
                <br /> info@motoline.al</p>
              <p>
                <strong className="footer_topTextStyle">EVENTS</strong>
                <br /> Fri 19:00 - 23:00</p>
            </div>


            <div className="col-6 col-md-3 col-lg-2 text-center text-md-start">
              <h5 className="fw-bold mb-3">Information</h5>
               <div className='footer_listContentStyle'>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>About Us</h4></a></li>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Contact Us</h4></a></li>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Privacy Policy</h4></a></li>
              </div>
            </div>


            <div className="col-6 col-md-3 col-lg-2 text-center text-md-start">
              <h5 className="fw-bold mb-3">My Account</h5>
               <div className='footer_listContentStyle'>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Order History</h4></a></li>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Wishlist</h4></a></li>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Gift Certificates</h4></a></li>
                <li className='footer_listStyle'><a href="#" className="text-light text-decoration-none"><h4 className='footer_bottomTextStyle'>Affiliate</h4></a></li>
               </div>
            </div>


            <div className="col-12 col-md-12 col-lg-5 text-center text-md-start">
              <h5 className="fw-bold mb-3">Register for the latest news</h5>
              <p>
                Enter your email below to subscribe to our newsletter and keep
                up to date with discounts and special offers.
              </p>
              <form className="d-flex flex-column flex-sm-row justify-content-center justify-content-md-start">
                <input
                  type="email"
                  className="form-control me-sm-2 mb-2 mb-sm-0"
                  placeholder="Your email address"
                />
                <button className="btn btn-danger">Subscribe</button>
              </form>
              <div className="mt-3">
                <a href="#"><img src={fb} alt="Facebook Logo" className="footer_iconsStyle"></img></a>
                <a href="#"><img src={ig} alt="Instagram Logo" className="footer_iconsStyle"></img></a>
                <a href="#"><img src={wp} alt="Whatsapp Logo" className="footer_iconsStyle"></img></a>
              </div>
            </div>
          </div>
        </div>
      </footer>

  )
}

export default FooterComp