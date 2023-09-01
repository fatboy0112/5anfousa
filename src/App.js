import React, { Suspense, lazy } from 'react';
import { isMobileOnly } from 'react-device-detect'
import LoadingIcon from './Components/Common/LoadingIcon';
import * as AWS from 'aws-sdk';
import Amplify from 'aws-amplify';

const DesktopRoutes = lazy(() => import('./Routes/desktopRoutes'));
const MobileRoutes = lazy(() => import('./Routes/mobileRoutes'));
const awsconfig =  {
    "aws_appsync_graphqlEndpoint": process.env.REACT_APP_GRAPHQL_ENDPOINT,
    "aws_appsync_region": process.env.REACT_APP_REGION,
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": process.env.REACT_APP_APPSYNC_KEY,
};

Amplify.configure(awsconfig);

AWS.config.update({
    region: process.env.REACT_APP_REGION,
    endpoint: `dynamodb.${process.env.REACT_APP_REGION}.amazonaws.com`, 
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  });

const dynamoClient = new AWS.DynamoDB.DocumentClient();

function App(props) {

    // const [ sessionTimeout, setSessionTimeout ] = useState(false);
    
    // const handleOnIdle = event => {
    //     if(differenceInMinutes(Date.now(), new Date(getLastActiveTime())) >= sessionTimer )  {
    //       // If user is on slot Casino page do not show timeout
    //       const isTypeCasino = includes(props.location.pathname, '/casino/game/');
    //       if(!isTypeCasino && !document.getElementById("live-stream-iframe"))
    //       setSessionTimeout(true);
    //     }
    //   };

      
    // const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    //     timeout: 1000 * 60 * sessionTimer,
    //     onIdle: handleOnIdle,
    //     debounce: 500
    //   });

    // const closeModal = () => {
    //   setSessionTimeout(false);
    // };
   
    return (
        <div className="main-wrap">
            <Suspense fallback={<LoadingIcon theme="dark centered" />}>
                { isMobileOnly ? <MobileRoutes isMobileOnly={ isMobileOnly } {...props } /> : <DesktopRoutes isMobileOnly={ isMobileOnly } {...props } /> }
            </Suspense>
        </div>

    );
}

export default App;
export { dynamoClient };