import { apiConfig } from '../config';
import axios from 'axios';
class genralServices {
    getDeviceLocation = () => {
        return new Promise((resolve, reject) => {
            fetch(apiConfig.routes.getDeviceLocation)
                .then(response => resolve(response.json()));
        });
    }

    getStatsStatus = (nextUrl) => {
        const url = nextUrl || `${apiConfig.routes.getStatsScore}`;
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => resolve(response.json()));
        });
    }

    getSearchEvents = ({value, sportId}, nextUrl) => {
        const url = nextUrl || `${apiConfig.routes.searchEvent}?participant=${value}&sport_id=${sportId}`;
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => resolve(response.json()));
        });
    }
    // getTranslations = () => {
    //     return new Promise((resolve, reject) => {
    //         fetch(apiConfig.routes.getTranslations)
    //             .then(response => resolve(response.json()));
    //     });
    // }

     tenetCasinoStatus = () => {
      return new Promise((resolve, reject) => {
            axios
                .get(apiConfig.routes.tenetCasinoStatus, {
                    params: {
                        unique_id: process.env.REACT_APP_UNIQUE_ID,
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });   
    }

}
const instance = new genralServices();

export default instance;
