import React, { Component } from 'react'
import  './about.css';

export class About extends Component {
  render() {
    return (
      <div>
       <div className="page">
  <div className="page-content about-page">
    <h1>VerBet</h1>
    <div>
      <p>
        VerBet, an online gaming company that specialize in sports betting
        and casino games, provides the top services for the players to enjoy a
        mesmerising online gaming experience.
      </p>
      <div className="about-details">
        <div className="about-item">
          <div className="item-header">
            <i className="fas fa-history" />
            <h2>24/7 Support</h2>
          </div>
          <div className="about-content">
            <p>
              Our Support team will help you resolve your issues at no time.
            </p>
          </div>
        </div>
        <div className="about-item">
          <div className="item-header">
            <i className="fas fa-dice" />
            <h2>Top Quality Games</h2>
          </div>
          <div className="about-content">
            <p>
              Besides our large games portfolio, We provide the top quality
              games in the market.
            </p>
          </div>
        </div>
        <div className="about-item">
          <div className="item-header">
            <i className="fas fa-handshake" />
            <h2>Dedicated Partners</h2>
          </div>
          <div className="about-content">
            <p>
              Our partners are dedicated to you, they're available for your
              assistance at any time.
            </p>
          </div>
        </div>
        <div className="about-item">
          <div className="item-header">
            <i className="fas fa-user-secret" />
            <h2>Privacy</h2>
          </div>
          <div className="about-content">
            <p>
              Your privacy is our topmost concern, play comfortably and calmly.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    )
  }
}

export default About
