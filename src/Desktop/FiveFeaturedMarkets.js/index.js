import React, { useEffect } from 'react';
import Markets from './Markets';

function FiveFeaturedMarkets(props) {
    let { markets, fixture, type, leagueName ,status} = props;

    useEffect(() => {
        if(markets){
        //selectFive(markets, obj_size);
        }
    },[markets,fixture]);


    // const selectFive = (items, obj_size) => {
    //     let obj = {};
    //     if(obj_size.length <= 5)
    //     {
    //         for (let key in items) {
    //             obj[key] = items[key];
    //         }
    //         setFinalMarkets(obj);
    //     }
    //     else 
    //     {
    //         for(let i =0;i<5;i++){
    //             obj[obj_size[i]] = items[obj_size[i]];
    //         }
    //         setFinalMarkets(obj);
    //     }
    // };

    let drawMarkets =
    markets && Object.keys(markets).length > 0 ? 
        (
            <Markets markets={markets} fixture={fixture} type={type} leagueName={leagueName} status= {status}/>
        ) 
        : 
        (
            null
        );
    
    return (
        drawMarkets ? 
            <div className="m-auto w-50">
                {drawMarkets}   
            </div>
        : null
    );
}

export default FiveFeaturedMarkets;
