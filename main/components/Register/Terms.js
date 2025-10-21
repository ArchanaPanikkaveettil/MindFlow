import React from "react";
import "./Terms.module.css";
const Terms = ({ setTermsandcondition }) => {
  return (
    <div>
      <div className="terms-main-body">
        <div className="terms-content">
          <div className="terms-content-title">Terms and Conditions</div>

          <p>
            Welcome to Bloogie! By accessing this website, you agree to the
            following terms and conditions. If you do not agree, please do not
            use our website.
          </p>

          <div className="terms-content-title">Use of the Website</div>
          <ul>
            <li>
              <strong>Content Ownership:</strong> Authors own their content but
              grant Bloogie a license to publish it.
            </li>
            <li>
              <strong>User Conduct:</strong> Users must not damage the website
              or engage in illegal activities.
            </li>
            <li>
              <strong>User Accounts:</strong> Users are responsible for their
              account security.
            </li>
          </ul>

          <div className="terms-content-title">Content Standards</div>
          <ul>
            <li>
              <strong>Prohibited Content:</strong> No harmful, illegal, or
              infringing content.
            </li>
            <li>
              <strong>Content Removal:</strong> Bloogie can remove inappropriate
              content at its discretion.
            </li>
          </ul>

          <div className="terms-content-title">
            Intellectual Property Rights
          </div>
          <ul>
            <li>
              <strong>Trademarks:</strong> Bloogie and its logo are trademarks
              of Bloogie. Do not use without permission.
            </li>
            <li>
              <strong>Copyright:</strong> All content compilation is Bloogie's
              property.
            </li>
          </ul>

          <div className="terms-content-title">Limitation of Liability</div>
          <p>
            Bloogie is not liable for any damages arising from the use of the
            website.
          </p>

          <div className="terms-content-title">Indemnification</div>
          <p>
            You agree to indemnify Bloogie against any losses arising from your
            use of the website.
          </p>
          <button
            className="terms-content-btn"
            onClick={() => setTermsandcondition(false)}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
