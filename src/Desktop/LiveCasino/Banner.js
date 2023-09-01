import React from 'react';
import BannerCarousel, {CarouselItem} from "../Home/BannerCarousel";

function Banner(props) {
    return (
        <BannerCarousel >
            {/*<CarouselItem  ><img  src="/images/AF4.jpg"/></CarouselItem>*/}
            <CarouselItem  ><img src="/images/AF3.jpg"/></CarouselItem>
            {/*<CarouselItem  ><img  src="./images/ll2.jpg"/></CarouselItem>*/}
        </BannerCarousel>
    );
}

export default Banner;
