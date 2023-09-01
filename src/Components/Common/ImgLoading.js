import React, { useEffect, useReducer } from 'react';

function reducer(currentSrc, action) {
    if (action.type === 'MAIN_IMAGE_LOADED') {
        return action.src;
    }
    if (!currentSrc) {
        return action.src;
    }
    return currentSrc;
}

function useProgressiveImage({ src, fallbackSrc }) {
    const [currentSrc, dispatch] = useReducer(reducer);

    useEffect(() => {
        const mainImage = new Image();
        const fallbackImage = new Image();

        mainImage.onload = () => {
            dispatch({ type: 'MAIN_IMAGE_LOADED', src });
        };
        fallbackImage.onload = () => {
            dispatch({ type: 'FALLBACK_IMAGE_LOADED', src: fallbackSrc });
        };

        mainImage.src = src;
        fallbackImage.src = fallbackSrc;
    }, [src, fallbackSrc]);

    return currentSrc === undefined ? fallbackSrc : currentSrc;
}

export function LazyImage(props) {
    const img = useProgressiveImage({
        src: props.image,
        fallbackSrc: props.fallbackImage,
    });

    return <img className={props.className} src={img} alt={props.altText} />;
}

export function LazyBackgroundImage(props) {
    const img = useProgressiveImage({
        src: props.image,
        fallbackSrc: props.fallbackImage,
    });

    return <div className={props.className} style={{ backgroundImage: 'url(' + img + ')' }} />;
}
