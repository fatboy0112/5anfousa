import * as Actions from './actionTypes';

// Get Banner Images
export const getBannerImage = () => {
    return (dispatch) => {
        dispatch({
            type: Actions.GET_BANNER,
        });
    };
};