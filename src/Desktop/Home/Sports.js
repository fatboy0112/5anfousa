import React from 'react';
import { sortBy } from 'lodash';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { staticPrematchSports } from '../../config/sports';
import { connect } from 'react-redux';
import { selectSportMobile } from '../../store/actions/todayActions';
import { withRouter } from 'react-router-dom';
import { Translate } from '../../localization';

const useStyles = makeStyles((theme) => ({
  root: {
	width: '100%',
	background: 'transparent'
  },
  heading: {
	fontSize: theme.typography.pxToRem(15),
	fontWeight: theme.typography.fontWeightRegular,
  },
}));

const SportsList = (props) => {
  const classes = useStyles();
	let sportList = Object.values(staticPrematchSports())
	sportList = sortBy(sportList, ['sort']);
	const { locations } = props;
	
	const onSportClick = (id) => {
		props.selectSportMobile(id);
		props.history.push('/d/sports');
	};
	const { selectedSport } = props;

  return (
      <div className={classes.root}>
          <h3>{Translate.sports}</h3>
          { sportList.map( sport => {
				const { name: sportName, sport_id: sportId } = sport;
				let activeClass = selectedSport === sportId ? 'active' : '' 
			  return (
    			<Accordion expanded={ false } className={activeClass} onChange={ () => null } onClick={ () => onSportClick(sport.sport_id)}>
        			<AccordionSummary
								// expandIcon={<ExpandMoreIcon />}
								aria-controls="panel1a-content"
								id="panel1a-header"
								// onClick={ () => onSportClick(sport.sport_id)}
							>
            <img alt="stream" className="nav-ico-light mr-3" width="20" src={`/images/sports/${sport.icon_name}-desktop-white.svg`}></img>

            			<Typography className={classes.heading}>{sportName}</Typography>
        			</AccordionSummary>
        {/* <AccordionDetails>
						<ul className='w-100'>
							{ locations.map(loc => 
								<li>
									<Accordion>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon />}
										aria-controls="panel1a-content"
										id="panel1a-header"
									>
										<Typography className={classes.heading}>{loc.Name}</Typography>
									</AccordionSummary>
									<AccordionDetails>Nothing found </AccordionDetails>

									</Accordion>
								</li>
							)}
						</ul>
					</AccordionDetails> */}
    </Accordion>
			  );
		  })}
      </div>

  );
};

const mapStateToProps = (state) => {
    return {
				locations: state.today.locations,
				selectedSport: state.today.selectedSport,
				language: state.general.language,
    };
};

const mapDispatchToProps = (dispatch) => {
	return {
		selectSportMobile: (sportId) => dispatch(selectSportMobile(sportId, true)),
	};
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SportsList));