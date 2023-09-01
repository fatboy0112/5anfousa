export const initialState = {
    bannerImages : 
    [{ id: 1, image_url: '/images/promotion/banner-7.png', url :'champions-league-rules'},
    { id: 2, image_url: '/images/promotion/banner-8.png', url : 'first-deposit-bonus'},
    { id: 3, image_url: '/images/promotion/banner-9.png', url: 'take-it-all'}],
    findMore : false,
};

  const promotionReducer = function (state = initialState, action) {
    switch (action.type) {
        // case Actions.GET_BANNER: {
        //     return {
        //         ...state,
        //         loading: action.value,
        //     };
        // }

        default:
            return state;
    }
};

export default promotionReducer;