import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash.map';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import createMuiTheme from '@material-ui/core/styles/createMuiStrictModeTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { Translate } from '../../localization';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#0f673d',
        },
    },
});

class MainMarketSelector extends Component {
    handleClick = (value) => {
        this.props.selectMainMarket(value);
    };

    render() {
        let { mainMarket, mainSelectedMarket } = this.props;
        let currentMainMarket = mainMarket;
        let selectedTab = 0;

        let marketToSelectList =
            currentMainMarket && currentMainMarket.length > 1 &&  // greater than 1 check because we won't show slider for single market
            map(currentMainMarket, (value, key) => {
                if (mainSelectedMarket === value.Id) {
                    selectedTab = key;
                }
                return (
                    <Tab
                        label={Translate.markets[value.Id]}
                        key={value.Id}
                        onClick={(e) => {
                            e.preventDefault();
                            this.handleClick(value.Id);
                            document.activeElement.blur();
                        }}
                    />
                );
            });

        return (
            <ThemeProvider theme={theme}>
                <AppBar position={'sticky'} color="default">
                    <Tabs
                        ref={this.refTabs}
                        value={selectedTab}
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="scrollable auto tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        className="market-tab-parent"
                    >
                        {marketToSelectList}
                    </Tabs>
                </AppBar>
            </ThemeProvider>
        );
    }
}

MainMarketSelector.propTypes = {
    mainMarket: PropTypes.array,
    mainSelectedMarket: PropTypes.string,
    selectMainMarket: PropTypes.func,
    events: PropTypes.array,
};

export default MainMarketSelector;
