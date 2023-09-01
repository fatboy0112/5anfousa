import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import store from './store';
import ReduxToastr from 'react-redux-toastr';
import ScrollToTop from './helper/ScrollToTop';

// import PageReloader from './helper/PageReloader';
// import Amplify from 'aws-amplify';
// import awsconfig from './aws-exports';

// Amplify.configure(awsconfig);

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <ScrollToTop />
            {/* <PageReloader /> */}
            <Route component={App} />
            {/* <BetfaroDesktop /> */}
        </BrowserRouter>
        <ReduxToastr
            timeOut={3000}
            newestOnTop={true}
            preventDuplicates
            position="top-right"
            getState={(state) => state.toastr}
            transitionIn="fadeIn"
            transitionOut="fadeOut"
            removeOnHover={false}
            closeOnToastrClick
        />
    </Provider>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
