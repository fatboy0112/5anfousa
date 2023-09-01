import React from 'react'
import { Link } from 'react-router-dom'
const FirstDepositBonus = () => {
  
  return (
    
      <div className='result-content'>
        <h1 className='breadcrumb mb-0 pt-0'>
          <Link to='/d/promotion'>
            Promotion
          </Link>
          <label>
            First Deposit Bonus
          </label>
        </h1>
        <div className='banner-card-wrap'>
          <div className='banner-card'>
            <img src='/images/promotion/banner-8.png' alt="banner-8" />
          </div>
        </div>
        <div className='heading-wrap d-flex align-items-center justify-content-between'>
          <h2>First Deposit Bonus!</h2>
        </div>
        <section className='theme-card mt-3'>
          <div style={ { color: 'white', textAlign: 'left' } }>
          Dummy Text.
          </div>
        </section>
      </div>
    
  )
}

export default FirstDepositBonus