import { Component } from 'react';
import { withRouter } from 'react-router-dom';

class PageReloader extends Component {
    componentDidMount() {
        let hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') {
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        }

        let document_hidden = document[hidden];

        document.addEventListener(visibilityChange, function () {
            if (document_hidden !== document[hidden]) {
                if (document[hidden]) {
                    // Document hidden
                    // console.log(111, 'Document hidden');
                } else {
                    // Document shown
                    // console.log(111, 'Document shown');
                    window.location.reload(false);
                }

                document_hidden = document[hidden];
            }
        });
    }

    render() {
        return null;
    }
}

export default withRouter(PageReloader);
