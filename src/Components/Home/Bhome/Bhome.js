import React, { Component } from 'react';
import  './stand.css';

class Bhome extends Component {
    render() {
        return (
            <div>
                <div className="container content-main-casino">
  <div className="row"></div>
  <section id="section-games" className="section-games">
    <nav role="navigation" className="nav-game-categories-wrap">
      <div className="container pl-0 pr-0">
        <div className="row">
          <div className="col-12 mt-2">
            <ul className="nav nav-fill nav-game-categories">
              <li className="nav-item">
                <a href="/ggslot" className="nav-link nav-link-game-category active">
                  <img
                    src="https://www.starsbet365.com/assets/images/icon-game-category-1.svg"
                    alt="Top Games"
                    className="nav-game-category-icon"
                  />
                  <span>Slots</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="/casino/lobby/evo" className="nav-link nav-link-game-category">
                  <img
                    src="https://www.maxbet.tn/assets/images/icon-game-category-6.svg"
                    alt="Casino category"
                    className="nav-game-category-icon"
                  />
                  <span>Evolution</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="/p-casino" className="nav-link nav-link-game-category">
                  <img
                    src="https://www.maxbet.tn/assets/images/icon-game-category-3.svg"
                    alt="Casino category"
                    className="nav-game-category-icon"
                  />
                  <span>Pragmatic</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="/casino/lobby/ezugi" className="nav-link nav-link-game-category">
                  <img
                    src="https://www.maxbet.tn/assets/images/icon-game-category-1.svg"
                    alt="Casino category"
                    className="nav-game-category-icon"
                  />
                  <span>ezugi</span>
                </a>
              </li>
             
            </ul>
          </div>
        </div>
      </div>
    </nav>
    <div className="wrap-game-listing">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="game-listing-filters">
             
              <div className="game-providers-dropdown col-sm-6 col-md-6 col-12 col-lg-5">
                {/* <span className="filterby-label">Filter by: </span> */}
                {/* <select id="providers-select" className="form-control">
                  <option selected="selected" value="all">
                    All Game Providers
                  </option>
               
                  <option onclick="location.href = '/ggslot';">AMATIC</option>
                  <option>NOVOMATIC</option>
                  <option onclick="location.href='unit_01.htm'">WAZDAN</option>
                  <option value={160}>NETENT</option>
                  <option value={160}>BOMBA</option>
                  <option value={160}>ARISTOCRAT</option>
                  <option value={160}>EGT</option>
                  <option value={160}>RACING</option>

                </select> */}
              </div>
              {/* <div className="game-filters-search col-lg-3 col-md-12">
                <input
                  type="text"
                  placeholder="Search"
                  className="form-control form-control-round"
                />
              </div> */}
            </div>
            <div className="row row-game-listing">
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={32} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.mbet216.com/remote-casino-assets/Zeppelin-Thumbnails_500x500.jpg"
                        alt="Zeppelin"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Zeppelin</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={34} className="item-game">
                  <span className="item-game-badge item-game-badge-hot">
                    <img src="https://www.maxbet.tn/assets/images/hot.svg" alt="hot" />
                  </span>
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Joker_s-Coins----Hold-and-Win---Playson-Thumbnails_500x5001.jpg"
                        alt="Joker's Coins: Hold and Win"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Joker's Coins: Hold and Win</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={36} className="item-game">
                  <span className="item-game-badge item-game-badge-hot">
                    <img src="https://www.maxbet.tn/assets/images/hot.svg" alt="hot" />
                  </span>
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Diamond-Fortunator-Hold-and-Win---Playson-Thumbnails_500x5001.jpg"
                        alt="Diamond Fortunator Hold and Win"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Diamond Fortunator Hold and Win</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={39} className="item-game">
                  <span className="item-game-badge item-game-badge-hot">
                    <img src="https://www.maxbet.tn/assets/images/hot.svg" alt="hot" />
                  </span>
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Burning-Fortunator---Playson-Thumbnails_500x5001.jpg"
                        alt="Burning Fortunator"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Burning Fortunator</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={40} className="item-game">
                  <span className="item-game-badge item-game-badge-hot">
                    <img src="https://www.maxbet.tn/assets/images/hot.svg" alt="hot" />
                  </span>
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Wolf-Power-Megaways---Playson-Thumbnails_500x5001.jpg"
                        alt="Wolf Power Megaways"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Wolf Power Megaways</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={42} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Megajack---Aztec-Gold-Thumbnails_500x500.jpg"
                        alt="Aztec Gold"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Aztec Gold</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={43} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Banana-King-HD_thumbnails_500x500.jpg"
                        alt="Banana King HD"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Banana King HD</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={44} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Panda-Joy---Inbet-Thumbnails_500x500.jpg"
                        alt="Panda Joy"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Panda Joy</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={45} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Igrosoft---Crazy-Monkey-2-Thumbnails_500x500.jpg"
                        alt="Crazy Monkey 2"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Crazy Monkey 2</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={47} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Diamond-Blitz-40---Fugaso-Thumbnails_500x5001.jpg"
                        alt="Diamond Blitz 40"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Diamond Blitz 40</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={49} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Mining-Madness---Gaming-Corps-Thumbnails_500x5001.jpg"
                        alt="Mining Madness"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Mining Madness</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={50} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Magic-Spinners-Thumbnails_500x500.jpg"
                        alt="Magic Spinners"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Magic Spinners</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={53} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Vegas-Blast---Kalamba-Thumbnails_500x5001.jpg"
                        alt="Vegas Blast"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Vegas Blast</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={54} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/100-Dragons---Inbet-Thumbnails_500x500.jpg"
                        alt="100 Dragons"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">100 Dragons</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={55} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Aristocrat---50-Dragons-Thumbnails_500x500.jpg"
                        alt="50 Dragons"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">50 Dragons</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={56} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Super-Clue-Thumbnails_500x500.jpg"
                        alt="Super Clue"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Super Clue</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={57} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/Jewel-Sea-Pirate-Riches---Fugaso-Thumbnails_500x5001.jpg"
                        alt="Jewel Sea Pirate Riches"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">Jewel Sea Pirate Riches</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-6">
                <div data-id={59} className="item-game">
                  {/**/}
                  <figure className="item-game-thumb">
                    <a href="/ggslot">
                      <img
                        src="https://www.maxbet.tn/remote-casino-assets/The-Mummy-Win-Hunters---Fugaso-Thumbnails_500x5001.jpg"
                        alt="The Mummy Win Hunters"
                      />
                    </a>
                    <a
                      href="/ggslot"
                      title="Play Now"
                      className="btn btn-primary item-game-launch"
                    >
                      <span>Play Now</span>
                    </a>
                  </figure>
                  <div className="item-game-desc">
                    <p className="item-game-title">
                      <a href="/ggslot">The Mummy Win Hunters</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
             
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

            </div>
        );
    }
}

export default Bhome;
