import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { Translate } from '../../localization';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#0f673d',
        },
    },
});

class ExtraMarketSelector extends Component {
    handleClick = (value) => {
        this.props.selectExtraMarket(value);
    };

    render() {
        let { extraMarketNames, extraSelectedMarket } = this.props;
        let selectedTab = 0;

        let marketToSelectList = map(extraMarketNames, (value, index) => {
            let className = ''
            if (extraSelectedMarket === value) {
                selectedTab = index;
                className='active'
            }
            return (
                <li
                    label={Translate.tabNames[value]}
                    key={index}
                    onClick={(e) => {
                        e.preventDefault();
                        this.handleClick(value);
                        document.activeElement.blur();
                    }}
                    className={ className }
                >
                    <a href>{Translate.tabNames[value]}</a>
                </li>
            );
        });

        return (
            // <ThemeProvider theme={theme}>
            //     <AppBar position="static" color="default">
            //         <Tabs
            //             ref={this.refTabs}
            //             value={selectedTab}
            //             indicatorColor="primary"
            //             textColor="primary"
            //             aria-label="scrollable auto tabs"
            //             variant="scrollable"
            //             scrollButtons="off"
            //         >
                        marketToSelectList
            //         </Tabs>
            //     </AppBar>
            // </ThemeProvider>
        );
    }
}

ExtraMarketSelector.propTypes = {
    extraMarketNames: PropTypes.array,
    extraSelectedMarket: PropTypes.string,
    selectExtraMarket: PropTypes.func,
};

export default ExtraMarketSelector;
