import React from 'react'
import { Link } from 'react-router-dom'

const ChampionsLeagueRules = () => {
  return (
    
      <div className='result-content'>
        <h1 className='breadcrumb mb-0 pt-0'>
          <Link to='/d/promotion'>
            Promotion
          </Link>
          <label>
            Champions League
          </label>
        </h1>
        <div className='banner-card-wrap'>
          <div className='banner-card'>
            <img src='/images/promotion/banner-7.png' alt="banner-7" />
          </div>
        </div>
        <div className='heading-wrap d-flex align-items-center justify-content-between'>
          <h2>Champion Bet</h2>
        </div>
        <section className='theme-card mt-3'>
          <div style={ { color: 'white', textAlign: 'left' } }>
            <p style={ { fontSize: '20px' } }><b>How to take part</b></p>
           Dummy Text
          </div>
        </section>
      </div>
  )
}

export default ChampionsLeagueRules