import React from "react";
import { Link } from "react-router-dom";
import motolinelogo from "../Images/Navigation/MotoLineLogo.png";
import "../CSS/privacyPolicyStyle.css";

export default function PrivacyPolicy() {
  return (
    <section className="ml-privacy-container">
      <div className="container">
        {/* Logo */}
        <div className="text-center ml-privacy-logo-wrap mb-3">
          <img
            src={motolinelogo}
            alt="MotoLine logo"
            style={{width: "300px"}}
          />
        </div>

        {/* Title + description */}
        <div className="text-center mb-3">
          <h1 className="ml-privacy-title">MotoLine - Privacy Policy</h1>
          <p className="text-muted ml-privacy-desc mb-0">
            How we collect, use and protect your information when you use MotoLine.
          </p>
        </div>

        {/* Cards grid */}
        <div className="row g-3 mt-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card">
              <div className="card-body">
                <h5 className="card-title">Information we collect</h5>
                <ul className="mb-0 ps-3">
                  <li>Account info: name, email, password (hashed), avatar.</li>
                  <li>Listings: photos, specs, VIN, price, location.</li>
                  <li>Messages between buyers and sellers.</li>
                  <li>Usage data: cookies & analytics.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card">
              <div className="card-body">
                <h5 className="card-title">How we use your data</h5>
                <p className="card-text mb-0">
                  To provide and improve the service — display listings, enable
                  messaging, prevent fraud, and send important updates. We do not
                  sell personal data to third parties.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card">
              <div className="card-body">
                <h5 className="card-title">Cookies & tracking</h5>
                <p className="card-text mb-0">
                  Cookies are used for essential functionality, preferences and
                  analytics. You can control cookies through your browser settings;
                  disabling non-essential cookies may affect features.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card">
              <div className="card-body">
                <h5 className="card-title">Data sharing & third parties</h5>
                <p className="card-text mb-0">
                  We share data with trusted service providers (hosting, analytics,
                  email) who only access data as needed. We may disclose information
                  to comply with legal requests.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card">
              <div className="card-body">
                <h5 className="card-title">Security</h5>
                <p className="card-text mb-0">
                  We use reasonable technical and organizational safeguards to
                  protect your data. If a breach affecting you occurs we will
                  follow legal notification requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 ml-pp-card d-flex">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Your rights & contact</h5>
                <ul className="mb-3 ps-3">
                  <li>Access: request a copy of your data.</li>
                  <li>Correction: ask us to fix inaccuracies.</li>
                  <li>Deletion: request deletion (subject to legal retention).</li>
                  <li>Marketing opt-out: unsubscribe anytime.</li>
                </ul>

                <div className="mt-auto">
                  <p className="mb-1 small">
                    For privacy requests visit our <Link to="/contact">Contact</Link> page
                    or email <a href="mailto:privacy@motoline.example">privacy@motoline.example</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="small text-muted mb-1">Effective date: October 10, 2025</p>
          <p className="text-muted mb-0">MotoLine — Built by riders, for riders.</p>
        </div>
      </div>
    </section>
  );
}
