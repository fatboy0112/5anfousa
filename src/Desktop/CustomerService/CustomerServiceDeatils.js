import React from 'react';
import { buttonList } from './data.json';
import Grid from '@material-ui/core/Grid';
import { Translate } from '../../localization/index.js';

const ContactDetails = () => {

  return (
      <div className='result-content'>
          <div className='heading-wrap d-flex align-items-center justify-content-between mb-2 mt-2'>
              <h2>{ Translate.customerServicePage }</h2>
          </div>
          <section className='theme-card mt-3'>
              <div>
                  <Grid container className='contact-cards-gap d-md-flex flex-wrap p-5'>
                      {buttonList.map((button) => (
                          <Grid item lg={ 3 } md={ 4 }className='px-2'>
                              <a key={ button.key } href='javascript:void(0);' className={ `left-content ${ button.className }` }>
                                  <div className='sub-icon-wrap'>
                                      <img src={ button.img } />
                                  </div>
                                  <div>{button.label}</div>
                              </a>
                          </Grid>
            ))}
                  </Grid>
              </div>

          </section>
      </div>
  );
};

export default ContactDetails;
