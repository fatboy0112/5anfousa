import { getResultsLocations , getResultsLocationsMobile} from './lsports.results.location.actions';
import * as Actions from '../actionTypes';
import { resultTotalSegments } from '../../../config';

// Get sports list
// export const getResultsSports = () => {
//     return (dispatch, getState) => {
//         let language = getState().general.language;
//         lSportsService
//             .getSports(language)
//             .then((sports) => {
//                 dispatch(setResultsSports(sports));
//             })
//             .catch((error) => {
//                 console.error(error);
//                 if (error && error.response && error.response.status && error.response.status === 401) {
//                     Util.handleRepeatedLogin(error.response);
//                 } else {
//                     toastr.error('', 'Something went wrong.');
//                 }
//             });
//     };
// };

// Set sports list
export const setResultsSports = (sports) => {
    return (dispatch) => {
        dispatch({ type: Actions.SET_RESULTS_SPORTS, sports });
    };
};

// Select active sport
export const selectSport = (sportId) => {
    return (dispatch) => {
        // dispatch(getResultsSports());
        dispatch({ type: Actions.ON_RESULTS_SPORT_SELECTED, sportId });
        dispatch(getResultsLocations(sportId));
    };
};

export const selectSportMobile = (sportId) => {
    return (dispatch) => {
        // dispatch(getResultsSports());
        dispatch({ type: Actions.ON_RESULTS_SPORT_SELECTED, sportId });
        let clear = true;
        for(let i=0; i<resultTotalSegments; i++) {
            dispatch(getResultsLocationsMobile(sportId, null, i, clear));
            clear = false;
        }
        
    };
};

