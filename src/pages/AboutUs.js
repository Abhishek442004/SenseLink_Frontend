import React from "react";
import "../styles/AboutUs.css";
import ProfileCard from "../components/ProfileCard";
import AbhishekAvatar from "../assets/Abhishek.jpg"; 
// import MohitAvatar from "../assets/Mohit.jpg";   

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1 className="main-heading">About SenseLink</h1>

      <p className="about-text">
        <strong>SenseLink</strong> is built with the vision of making IoT device setup and monitoring fast, seamless, and user-friendly. Whether you're a hobbyist or a professional, our platform enables you to connect and configure devices within seconds.
      </p>

      <p className="about-text">
        We aim to remove the complexity from sensor integration, providing a unified platform for onboarding, real-time data tracking, and device management.
      </p>

      <p className="about-text">
        SenseLink is not just a tool — it's a launchpad for innovation. Our team is committed to empowering individuals and businesses to build smarter systems effortlessly.
      </p>

      <h2 className="sub-heading">Why Choose SenseLink?</h2>
      <ul className="features-list">
        <li>🔗 Quick and easy device onboarding</li>
        <li>📡 Real-time sensor data display</li>
        <li>🔒 Secure and reliable platform</li>
        <li>⚙️ Clean and simple interface</li>
        <li>💡 Developer and user-friendly design</li>
      </ul>

      <h2 className="sub-heading">Our Vision</h2>
      <p className="about-text">
        To be the trusted link between devices and data — making sensor-powered solutions more accessible, reliable, and impactful across industries.
      </p>
    

        <h2 className="sub-heading">Meet the Team</h2>
    <div className="team-cards">
      
      <ProfileCard
        name="Abhishek Duharia"
        title="Software Engineer"
        handle="abhishek"
        status="Online"
        contactText="Contact Me"
        avatarUrl={AbhishekAvatar}
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => console.log('Contact clicked')}
        />

        <ProfileCard
        name="Mohit Choudhary"
        title="IOT Engineer"
        handle="Mohit"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/path/to/avatar.jpg" 
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => console.log('Contact clicked')}
        />

        <ProfileCard
        name="Saumitra Tandon"
        title="AI/ML Engineer"
        handle="Saumitra"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/path/to/avatar.jpg"
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => console.log('Contact clicked')}
        />
        </div>


      <p className="footer-note">Built by engineers. Designed for everyone.</p>
    </div>
  );
};

export default AboutUs;
