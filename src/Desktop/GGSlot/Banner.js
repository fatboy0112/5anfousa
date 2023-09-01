import React from 'react';
import BannerCarousel, {CarouselItem} from "../../Components/Home/BannerCarousel";

function Banner(props) {
    return (

        <BannerCarousel >
            {/*<CarouselItem  ><img  src="/images/AF4.jpg"/></CarouselItem>*/}
            <CarouselItem  ><img src="https://static.vecteezy.com/ti/vecteur-libre/p3/1213123-banniere-de-casino-de-luxe-or-noir-aces-noir-as-vectoriel.jpg"/></CarouselItem>
            {/*<CarouselItem  ><img  src="./images/ll2.jpg"/></CarouselItem>*/}
        </BannerCarousel>
    );
}

export default Banner;
