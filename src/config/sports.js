import Util from "../helper/Util";
import { Translate } from "../localization";
import { orderBy, remove } from 'lodash';

export const sportAndLocationData = () => {
 return {
    1 : { Id: 1, Name: 'Football', Count: 0, Locations: [], priority: 1},
    2 : { Id: 2, Name: 'Basketball', Count: 0, Locations: []},
    4 : { Id: 4, Name: 'Ice Hockey', Count: 0, Locations: []},
    5 : { Id: 5, Name: 'Tennis', Count: 0, Locations: []},
    23 : { Id: 23, Name: 'Volleyball', Count: 0, Locations: []},
    10 : { Id: 10, Name: 'Boxing', Count: 0, Locations: []},
    // 131506 : { Id: 131506 , name: 'American Football',  Count: 0, Locations: []},
    // 154914 : { Id: 154914 , name: 'Baseball',  Count: 0, Locations: []},
    // 530129 : { Id: 530129 , name: 'Hockey',  Count: 0, Locations: []},
    // 1149093 : { Id: 1149093 , name: 'Badminton',  Count: 0, Locations: []},
    // 452674 : { Id: 452674 , name: 'Cricket',  Count: 0, Locations: []},
    // 687887 : { Id: 687887 , name: 'Futsal',  Count: 0, Locations: []},
    // 687889 : { Id: 687889 , name: 'Golf',  Count: 0, Locations: []},
    // 35709 : { Id: 35709 , name: 'Handball',  Count: 0, Locations: []},
    // 274792 : { Id: 274792 , name: 'Rugby Leagues',  Count: 0, Locations: []},
    // 265917 : { Id: 265917 , name: 'Table Tennis',  Count: 0, Locations: []},
    // 621569 : {Id: 621569, name: 'Beach Volleyball', Count: 0, Locations: []},
    // 274791 : {Id: 274791, name: 'Rugby Union', Count: 0, Locations: []},
    // 154923 : {Id: 154923, name: 'Darts', Count: 0, Locations: []},
    // 389537 : {Id: 389537, name: 'Australian Rules', Count: 0, Locations: []},
    // 35706 :  {Id: 35706, name: 'Floorball', Count: 0, Locations: []},
    // 262622 : {Id: 262622, name: 'Snooker', Count: 0, Locations: []},

}
}
    
export const locationSortingOrder = ['International', 'Turkey', 'England', 'Germany', 'Italy', 'Spain', 'France', 'Netherlands', 'Portugal'];

// Order of this constant is of Home Page Leagues
export const leagueSortingOrder = [65, 8363, 63, 67, 2944, 64, 14896 ];
export const locationSortingOrderResults = {
    1: ['Turkey', 'England', 'Germany', 'International', 'Italy', 'Spain',
            'France', 'Netherlands', 'Portugal', 'Switzerland', 'Belgium', 'Denmark',
            'Czech Republic', 'Ireland', 'Austria', 'Scotland', 'Poland', 'Greece', 'Russia',
            'Cyprus', 'Mexico', 'Peru', 'Morocco', 'Argentina', 'Bolivia', 'Brazil', 'Aruba',
            'Uruguay', 'Venezuela', 'Colombia', 'Costa rica', 'Australia', 'Israel',
            'Northern Ireland', 'Wales', 'Australia', 'Egypt', 'Tunisia', 'Algeria',
            'Afghanistan', 'Saudi Arabia', 'Kuwait', 'India', 'South Africa'],
    2: ['United States', 'International', 'Spain', 'Italy', 'Germany', 'Greece','Australia',
            'Turkey', 'Russia', 'Austria', 'Israel', 'Poland', 'South Korea', 'Japan', 'Bahrain', 'Qatar'],
    4: [83, 4, 248, 143, 161, 192, 202, 79, 147, 22, 2, 135, 192, 22, 78, 142, 126],
    5:  ['England', 'United States', 'Australia', 'Switzerland', 'France', 'Germany', 'Spain', 'New Zealand', 'Argentina'],
    23: [52, 4, 2, 6, 5, 13, 16, 17, 21, 41, 42, 43, 44, 62, 63, 70, 72, 73, 74, 75, 76, 90, 113, 164, 175, 202, 203, 204, 205, 206, 286, 299, 337,
            338, 440, 834, 909, 910, 285],
    10: [1, 52, 2, 7, 29, 88, 662],
};


export const homePageLeagues = [
    {league_name_en: 'UEFA Champions League', league_id: 7, is_favorite: false, sport_id: 1},
    {league_name_en: 'UEFA Europa League', league_id: 679, is_favorite: false, sport_id: 1},
    {league_name_en: 'Bundesliga', league_id: 35, is_favorite: false, sport_id: 1},
    {league_name_en: 'LaLiga', league_id: 8, is_favorite: false, sport_id: 1},
    {league_name_en: 'Super Lig', league_id: 52, is_favorite: false, sport_id: 1},
    {league_name_en: 'Premier League', league_id: 17, is_favorite: false, sport_id: 1},
    {league_name_en: 'Eredivisie', league_id: 37, is_favorite: false, sport_id: 1},
    {league_name_en: 'Serie A', league_id: 4, is_favorite: false, sport_id: 1},
    {league_name_en: 'NBA', league_id: 132, is_favorite: false, sport_id: 2},
    {league_name_en: 'UFC', league_id: 14896, is_favorite: false, sport_id: 315},// didn't get in Betrader sheet
];

export const staticPrematchSports = () => {
    return {
       1 : { sport_id: 1, name: Translate.football, icon_name: 'Football', Count: 0, Locations: [], priority: 1, sort: 1},
       2 : { sport_id: 2, name: Translate.basketball, icon_name: 'Basketball', Count: 0, Locations: [], sort: 5},
       4 : { sport_id: 4, name: Translate.iceHockey, icon_name: 'Ice Hockey', Count: 0, Locations: [], sort: 14},
       5 : { sport_id: 5, name: Translate.tennis, icon_name: 'Tennis', Count: 0, Locations: [], sort: 2},
       23 : { sport_id: 23, name: Translate.volleyball, icon_name: 'Volleyball', Count: 0, Locations: [], sort: 16},
       10 : { sport_id: 10, e_sport: true, name: Translate.boxing, icon_name: 'Boxing', Count: 0, Locations: [], sort: 9},
    //    530129 : {sport_id: 530129 , name: Translate.hockey, icon_name: 'Hockey', Count: 0, Locations: [], sort: 3},
    //    154914 : { sport_id: 154914 , name: Translate.baseball, icon_name: 'Baseball', Count: 0, Locations: [], sort: 4},
    //    265917 : {sport_id: 265917 , name: Translate.tableTennis, icon_name: 'TableTennis', Count: 0, Locations: [], sort: 6},
    //    131506 : { sport_id: 131506 , name: Translate.americanFootball, icon_name: 'AmericanFootball',  Count: 0, Locations: [], sort: 7},
    //    1149093 : {sport_id: 1149093 , name: Translate.badminton, icon_name: 'Badminton', Count: 0, Locations: [], sort: 8},
    //    452674 : {sport_id: 452674 , name: Translate.cricket, icon_name: 'Cricket', Count: 0, Locations: [], sort: 10},
    //    687887 : {sport_id: 687887 , k_sport: true, name: Translate.futsal, icon_name: 'Futsal', Count: 0, Locations: [], sort: 11},
    //    687889 : {sport_id: 687889 , name: Translate.golf, icon_name: 'Golf', Count: 0, Locations: [], sort: 12},
    //    35709 : {sport_id: 35709 , name: Translate.handball, icon_name: 'Handball', Count: 0, Locations: [], sort: 13},
    //    274792 : {sport_id: 274792 , name: Translate.rugbyLeagues, icon_name: 'AmericanFootball', Count: 0, Locations: [], sort: 15},
   };
};


export const sortedLocations = (locationArray) => {
    const sortingOrder = locationSortingOrder;
        let preSortedList = [];
            for(let s in sortingOrder) {
                let elem = remove (locationArray, l => {
                    if (l) return l.name_en === sortingOrder[s];
                });
            if (elem.length > 0) preSortedList.push(elem[0]);
            }
            locationArray = locationArray.filter(loc => loc.name_en);
            return preSortedList.concat(locationArray.sort((a,b) => {
                Util.compareStrings(a.name_en, b.name_en)
            }));
};

export const sortedLocationsResults = (locationArray, sportId) => {
    let toCompare;
    if(sportId == 1 || sportId == 3 || sportId == 5 ) {
        toCompare = 'location_name';
    }
    else {
        toCompare = 'location_id';
    }
    const sortingOrder = locationSortingOrderResults;
        let preSortedList = [];
            for(let s in sortingOrder[sportId]) {
                let elem = remove (locationArray, l => {
                    if (l) return l[toCompare] == sortingOrder[sportId][s];
                });
            if (elem.length > 0) preSortedList.push(elem[0]);
            }
            return preSortedList.concat(locationArray.sort((a,b) => Util.compareStrings(a.location_name, b.location_name)));
};

// This function sort the event based on following:
// Home page league + Locations filter + rest match

export const sortLiveEvents = (events) => {

    const sortingOrderLeague = leagueSortingOrder;
    const sortingOrderLocation = locationSortingOrder;
    let preSortedListByLeague = [];
    let preSortedListByLocation = [];
    for (let s in sortingOrderLeague) {
        let elem = remove(events, (l) => {
            if (l) return l.league.Id === sortingOrderLeague[s];
        });
        if (elem.length > 0) {
            for (let i in elem) preSortedListByLeague.push(elem[i]);
        }
    }

    for (let s in sortingOrderLocation) {
        let elem = remove(events, (l) => {
            if (l) return l.location.name_en === sortingOrderLocation[s];
        });
        if (elem.length > 0) {
            for (let i in elem) preSortedListByLocation.push(elem[i]);
        }
    }

    return preSortedListByLeague.concat(preSortedListByLocation).concat(events);
};