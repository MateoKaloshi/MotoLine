import React from "react";
import { Link } from "react-router-dom";
import {
  FaMotorcycle,
  FaHandshake,
  FaUserShield,
  FaQuestionCircle,
  FaUsers,
  FaHeadset,
} from "react-icons/fa";
import motolinelogo from "../Images/Navigation/MotoLineLogo.png";
import "../CSS/AboutUsStyle.css";

export default function AboutUs() {
  return (
    <section className="ml-aboutus-container">
      <div className="ml-aboutus-wrapper">
        {/* Large Logo */}
        <div className="ml-aboutus-logo">
          <img src={motolinelogo} alt="MotoLine Logo" />
        </div>

        <h1 className="ml-aboutus-title">
          Buy &amp; Sell Bikes — Fast, Fair, Focused
        </h1>
        <p className="ml-aboutus-description">
          MotoLine is a trusted online marketplace built exclusively for
          motorcycle lovers. Whether you're buying, selling, or exploring, we
          make every ride connection simple, safe, and focused on what matters —
          the bikes.
        </p>

        <div className="ml-aboutus-buttons">
          <Link to="/addbike" className="ml-btn-primary">
            Sell Your Bike
          </Link>
          <Link to="/home" className="ml-btn-secondary">
            Look For A Bike
          </Link>
        </div>

        {/* Info Cards Grid */}
        <div className="ml-aboutus-grid">
          <div className="ml-card">
            <h3>
              <FaMotorcycle className="ml-icon" /> How it works — Sellers
            </h3>
            <ol>
              <li>Register or log in to your MotoLine account.</li>
              <li>Create a detailed listing with photos, specs, and price.</li>
              <li>
                Publish your bike — interested buyers contact you directly.
              </li>
            </ol>
          </div>

          <div className="ml-card">
            <h3>
              <FaHandshake className="ml-icon" /> How it works — Buyers
            </h3>
            <ul>
              <li>Search by brand, model, year, or price range.</li>
              <li>Chat securely with sellers through MotoLine.</li>
              <li>Meet, inspect, and finalize your deal with confidence.</li>
            </ul>
          </div>

          <div className="ml-card">
            <h3>
              <FaUserShield className="ml-icon" /> Safety &amp; Transparency
            </h3>
            <p>
              MotoLine promotes honesty and safety. Always meet in public areas,
              verify VIN and documents, and use secure payment methods. We never
              store or process direct payments.
            </p>
          </div>

          <div className="ml-card">
            <h3>
              <FaQuestionCircle className="ml-icon" /> Why choose MotoLine?
            </h3>
            <ul>
              <li>Focused audience — real motorcycle buyers and sellers.</li>
              <li>Free listings with optional boosts for visibility.</li>
              <li>Clean design, verified listings, and faster transactions.</li>
            </ul>
          </div>

          <div className="ml-card">
            <h3>
              <FaUsers className="ml-icon" /> Community &amp; Events
            </h3>
            <p>
              Join local MotoLine meetups, riding groups, and charity rides.
              Connect with passionate bikers who share your love for two wheels.
              We’re more than a marketplace — we’re a community.
            </p>
          </div>

          <div className="ml-card">
            <h3>
              <FaHeadset className="ml-icon" /> Support &amp; Contact
            </h3>
            <p>
              Our team is available 24/7 for help. Visit our{" "}
              <Link to="/contact" className="ml-link">
                Contact
              </Link>{" "}
              page for support, listing assistance, or feedback. We listen and
              improve constantly.
            </p>
          </div>
        </div>

        <p className="ml-aboutus-footer">
          MotoLine — Built by riders, for riders. Join the ride today.
        </p>
      </div>
    </section>
  );
}
