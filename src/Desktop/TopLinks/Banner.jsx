import React from 'react';
import PropTypes from 'prop-types';

const Banner = (props) => {
  return (
      <div className="banner">
          <img src="/images/small-banner2.jpg" />

          {/* <div className="owl-carousel owl-theme">
              <div className="item">
                  <img className="off-1200 off-1500" src="/images/imgpsh_fullsize_anim.jpg" />
                  <img className="off-1200"  src="/images/home-banner-1.jpeg" />
                  <img className=""  src="/images/small-banner.jpg" />
              </div>
              <div className="item">
                  <img className="off-1200 off-1500" src="/images/imgpsh_fullsize_anim (1).jpg" />
                  <img className="off-1200" src="/images/betafro-2.jpg" />
                  <img  src="/images/small-banner1.jpg" />
              </div>
              <div className="item">
                  <img className="off-1200 off-1500" src="/images/imgpsh_fullsize_anim (2).jpg" />
                  <img className="off-1200" src="/images/betafro3.jpg" />
                  <img src="/images/small-banner2.jpg" />
              </div>
          </div> */}
      </div>
  );
};

Banner.propTypes = {
    userData: PropTypes.object,
    setLanguage: PropTypes.func,
    language: PropTypes.string,
    headerClassname: PropTypes.string,
};

export default Banner;
