import { Button } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
function PromotionBanners(props) {
    return (
        <div className='odds-panel_promotion'>
            {props.bannerImages.map((data) => {
            return(
                <>
                    <img src={data.image_url} alt="promotion-banner" className="Promotion_banner" />
                   <Link to ={`/d/promotion/${data.url}`}> <Button className="find-more_btn"><b>FIND OUT MORE</b></Button></Link>
                </>
            );
        })}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        bannerImages: state.promotion.bannerImages,
    };
};

export default connect(mapStateToProps,null)(PromotionBanners);
