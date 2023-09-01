import React from 'react'
import { Link, useHistory } from 'react-router-dom'

const TakeItAllResult = () => {
  const history = useHistory()
  return (
      <div className='result-content'>
        <h1 className='breadcrumb mb-0 pt-0'>
          <Link to='/d/promotion'>
            Promotion
          </Link>
          <label>
            Take it All
          </label>
        </h1>
        <div className='banner-card-wrap'>
          <div className='banner-card'>
            <img src='/images/promotion/banner-9.png' alt="banner-9" />
          </div>
        </div>
        <div className='heading-wrap d-flex align-items-center justify-content-between'>
          <h2>BE A WINNER AND TAKE IT ALL</h2>
        </div>
        <section className='theme-card mt-3'>
          <div style={ { color: 'white', textAlign: 'left' } }>
            <p style={ { fontSize: '20px' } }><b>TO BE WON</b></p>
            Dummy Text.
            <a href='javascript:void(0);' className='btn btn-primary text-uppercase' onClick={ () => history.push('/d') }>Place a Bet</a>

          </div>
        </section>
      </div>
  )
}

export default TakeItAllResult