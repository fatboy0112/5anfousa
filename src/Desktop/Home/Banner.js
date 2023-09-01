import React from 'react';
import BannerCarousel, {CarouselItem} from './BannerCarousel';

function Banner(props) {
    return (

        <BannerCarousel >

            <CarouselItem left='0%'><img  src="/images/banners/aff1.png" alt="aff1" /></CarouselItem>
            <CarouselItem  left='100%'><img  src="/images/banners/aff2.png" alt="aff2" /></CarouselItem>
            <CarouselItem  left='200%'><img  src="/images/banners/aff3.png" alt="aff3" /></CarouselItem>
            <CarouselItem  left='300%'><img  src="/images/banners/aff4.png" alt="aff4" /></CarouselItem>
        </BannerCarousel>
    );
}

export default Banner;
