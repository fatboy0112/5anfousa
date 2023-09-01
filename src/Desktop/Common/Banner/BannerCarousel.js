import { connect } from 'react-redux';

const BannerCarousel = (props) => {
    return null
};

const mapStateToProps = (state) => {
    return {
        banners: state.general.banners,
        matchBanners: state.general.matchBanners,
        language: state.general.language,
    };
};

export default connect(mapStateToProps)(BannerCarousel);
