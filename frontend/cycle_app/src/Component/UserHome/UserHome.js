// import { profile } from 'console';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';

// import CycleTile from './cycleTile';
import "./css/bootstrap.min.css";
import "./css/bootstrap-theme.min.css";
import "./css/fontAwesome.css";
import "./css/hero-slider.css";
import "./css/owl-carousel.css";
import "./css/style.css";
import CycleTile from './cycleTile';
// import "./js/vendor/modernizr-2.8.3-respond-1.4.2.min.js";

class UserHome extends React.Component {

  constructor(props) {

    super(props);
    this.state = {
      userId: localStorage.getItem("userId"),
      token: `Bearer ${localStorage.getItem("token")}`,
      toLogin: false,
      allData: {}, // Stores all the data corresponding to all dealers, cycleStores and cycles. Initialized in component did mount
      favorites: [], // allData[dealerId][cycleStoreId][cycleId]
      currentCycle: {}, // currentCycle :{transaction:{}, allData:{Stores data of currently booked/ in use cycle}}

    };

  };



  //currentCycle.response = 0 if user has no in use or booked cycle

  async componentDidMount() {

    try {

      // Request to currentStatus 

      let req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          token: this.state.token
        })
      };

      let res = await fetch('http://localhost:5000/user/currentStatus', req);
      let response = await res.json();
      // console.log("response",response);

      if (res.status === 200) {

        //Request to viewCycle

        setInterval(() => {
          let time = new Date();
          let trans = this.state.currentCycle.transaction;
          if (trans.status == 1) {

            let time_initial = Date.parse(trans.timeStart);
            if (time - time_initial > 3600000) {

              this.cancelBooking(trans.dealerId, trans.cycleStoreId, trans.cycleId);

            }

          }
        }, 300000);



        setInterval(() => {

          let time = new Date();
          let trans = this.state.currentCycle.transaction;
          let currentCycle = this.state.currentCycle;
          if (trans.status == 2) {

            let time_initial = Date.parse(trans.timeStart);
            let time_diff = (time - time_initial) / 3600000;
            currentCycle.transaction.cost = (time_diff * trans.rate).toFixed(1);
            this.setState({ currentCycle: currentCycle });


          }
        }, 30000);



        req = {
          method: 'POST',
          headers: {
            'authorization': this.state.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.state.userId,
            token: this.state.token
          })
        };

        res = await fetch('http://localhost:5000/user/viewFavorite', req);
        let response2 = await res.json();
        // console.log("allData : ",response.temp);


        if (res.status === 200) {

          // console.log("response2 ",response2);
          if (response.allData) {     // allData stores all data about current booked cycle. temp stores all data of all cycles
            this.setState({ currentCycle: { transaction: response.transaction, allData: response.allData }, allData: response.temp, favorites: response2.data });

            let time = new Date();
            let trans = this.state.currentCycle.transaction;
            let currentCycle = this.state.currentCycle;
            if (trans.status == 2) {

              let time_initial = Date.parse(trans.timeStart);
              let time_diff = (time - time_initial) / 3600000;
              currentCycle.transaction.cost = (time_diff * trans.rate).toFixed(1);
              this.setState({ currentCycle: currentCycle });
            }

          } else {
            this.setState({ currentCycle: { transaction: { status: 0 } }, allData: response.temp, favorites: response2.data });
          }

        }

      } else {
        alert(response.msg);
        this.setState({ toLogin: true })

      }

    } catch (err) {

      console.log(err);
      alert(err);

    }

  }

  async bookCycle(dealerId, cycleStoreId, cycleId, rate) {

    // console.log("Successful");
    try {
      // console.log("dealerId ",dealerId);

      // Request to bookCycle

      const req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          token: this.state.token,
          dealerId: dealerId,
          cycleStoreId: cycleStoreId,
          cycleId: cycleId,
          rate: rate
        })

      };

      const res = await fetch('http://localhost:5000/user/bookCycle', req);
      const response = await res.json();

      if (res.status === 200) {

        //May add pop up with response.msg

        console.log("All data ", this.state.allData);

        let allData = this.state.allData;
        allData[dealerId][cycleStoreId][cycleId].countAvailable -= 1;

        this.setState({
          currentCycle: {
            transaction: {
              userId: this.state.userId,
              dealerId: dealerId,
              cycleStoreId: cycleStoreId,
              cycleId: cycleId,

              timeStart: new Date(),

              cost: 0,
              rate: rate,
              status: 1
            }, allData: this.state.allData[dealerId][cycleStoreId][cycleId]
          }, allData: allData
        });


      } else if (res.status === 400) {

        alert(response.msg);

      } else {
        alert(response.msg);
        this.setState({ toLogin: true })

      }

    } catch (err) {

      console.log(err);
      alert(err);

    }

  }


  async confirmBooking() {

    try {

      // Request to bookCycle

      const req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          token: this.state.token
        })

      };

      const res = await fetch('http://localhost:5000/user/confirmBooking', req);
      const response = await res.json();

      if (res.status === 200) {

        //May add pop up with response.msg

        this.setState({
          currentCycle: {
            transaction: {
              userId: this.state.userId,
              dealerId: this.state.currentCycle.dealerId,
              cycleStoreId: this.state.currentCycle.cycleStoreId,
              cycleId: this.state.currentCycle.cycleId,

              timeStart: new Date(),

              cost: 0,
              rate: this.state.currentCycle.rate,
              status: 2
            }, allData: this.state.currentCycle.allData
          }
        });

      } else {
        alert(response.msg);
        this.setState({ toLogin: true })

      }

    } catch (err) {

      console.log(err);
      alert(err);

    }
    window.location.reload(false);
  }


  async cancelBooking(dealerId, cycleStoreId, cycleId) {

    try {

      // Request to cancelBooking

      const req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          token: this.state.token
        })

      };

      const res = await fetch('http://localhost:5000/user/cancelBooking', req);
      const response = await res.json();

      if (res.status === 200) {

        //May add pop up with response.msg

        let allData = this.state.allData;
        allData[dealerId][cycleStoreId][cycleId].countAvailable += 1;

        this.setState({ currentCycle: { transaction: { status: 0 } }, allData: allData });

      } else {
        alert(response.msg);
        this.setState({ toLogin: true })

      }

    } catch (err) {

      console.log(err);
      alert(err);

    }

  }

  async addFavorite(dealerId, cycleStoreId, cycleId) {

    try {

      // console.log("dealerId: ",dealerId)

      // Request to addFavorite

      const req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          dealerId: dealerId,
          cycleStoreId: cycleStoreId,
          cycleId: cycleId,
          token: this.state.token
        })

      };

      let res = await fetch('http://localhost:5000/user/addFavorite', req);
      let favorites = this.state.favorites;
      favorites.push(this.state.allData[dealerId][cycleStoreId][cycleId]);

      let allData = this.state.allData;
      allData[dealerId][cycleStoreId][cycleId].favorite = true;

      if (this.state.currentCycle.allData && cycleId === this.state.currentCycle.allData.cycleId) {

        let currentCycle = this.state.currentCycle;
        currentCycle.allData.favorite = true;
        this.setState({ favorites: favorites, currentCycle: currentCycle, allData: allData });

      } else {

        this.setState({ favorites: favorites, allData: allData });

      }



      //Change color of star button from css

    } catch (err) {

      console.log(err);
      alert(err);

    }

  }



  async deleteFavorite(dealerId, cycleStoreId, cycleId) {

    try {

      // Request to deleteFavorite

      const req = {
        method: 'POST',
        headers: {
          'authorization': this.state.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.state.userId,
          dealerId: dealerId,
          cycleStoreId: cycleStoreId,
          cycleId: cycleId,
          token: this.state.token
        })

      };

      const res = await fetch('http://localhost:5000/user/deleteFavorite', req);
      const response = await res.json();
      // console.log("Delete response ",response);

      let favorites = this.state.favorites;

      for (let i = 0; i < favorites.length; i++) {

        if (favorites[i].cycleId.toString() === cycleId) {
          favorites.splice(i, 1);
          break;
        }

      }

      let allData = this.state.allData;
      allData[dealerId][cycleStoreId][cycleId].favorite = false;
      // console.log(allData);

      if (this.state.currentCycle.allData && cycleId === this.state.currentCycle.allData.cycleId) {

        let currentCycle = this.state.currentCycle;
        currentCycle.allData.favorite = false;
        this.setState({ favorites: favorites, currentCycle: currentCycle, allData: allData });

      } else {

        this.setState({ favorites: favorites, allData: allData });

      }

      //Change color of star button from css.

    } catch (err) {

      console.log(err);
      alert(err);

    }

  }

  // User information, past transactions and favorites to be shown in profile.

  // async viewProfile(){

  //     try{

  //         // Request to viewProfile

  //         let req = {
  //             method : 'GET',
  //             headers : {
  //                 'authorization' : this.state.token, 
  //                 'Content-Type': 'application/json',
  //             },
  //             body : JSON.stringify({
  //                 userId:this.state.userId,
  //                 token:""
  //             })

  //         };

  //         let res = await fetch('/user/viewProfile',req);
  //         let profileData  = await res.json();        //Object of profile data

  //         // REquest to view favorite cycle

  //         res = await fetch('/user/viewFavorite',req);
  //         let favoriteData = await res.json();        //Array of favorite cycles data

  //         //Request to view past transactions

  //         res = await fetch('/user/pastTransaction',req);
  //         let transactionData = await res.json();         //Array of transactions

  //         this.setState({profile:profileData, favorites:favoriteData, transactions:transactionData});

  //     }catch(err){

  //         console.log(err);
  //         alert(err);

  //     }

  // }



  render() {

    if (this.state.toLogin) {
      localStorage.clear();
      return (<Navigate to="/login" replace={true} />)

    }

    let currStatus;

    if (this.state.currentCycle.transaction) {

      if (this.state.currentCycle.transaction.status === 0) {

        currStatus = (<section className="featured-places">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-heading">
                  <span><h1>Booked Cycles</h1></span>
                  <h2 id="store-name">You have not booked any cycle. Scroll down to book your favorite cycles</h2>
                  <hr />
                </div>
              </div>
            </div>
            {/* <CycleTile name="Vector91" rate={15} contact={7268998999} booking_time={(new Date()).toLocaleString()}  /> */}
          </div>
        </section>);

      } else if (this.state.currentCycle.transaction.status === 1) {
        let button;
        if (this.state.currentCycle.allData.favorite) {
          button = <button style={{ "background-color": "Orange", "color": "white" }} onClick={() => { this.deleteFavorite(this.state.currentCycle.allData.dealerId, this.state.currentCycle.allData.cycleStoreId, this.state.currentCycle.allData.cycleId) }}>Remove Favourites</button>
        } else {
          button = <button style={{ "background-color": "Orange", "color": "white" }} onClick={() => { this.addFavorite(this.state.currentCycle.allData.dealerId, this.state.currentCycle.allData.cycleStoreId, this.state.currentCycle.allData.cycleId) }}>Add Favourites</button>
        }
        currStatus = (<section className="featured-places">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-heading">
                  <span><h1>Booked Cycles</h1></span>
                  <h2 id="store-name">This is the cycle you have currently booked.</h2>
                  <hr />
                </div>
              </div>
            </div>
            <div className="row">
              {/* This one element contains a card to hold one cycle*/}
              {/* Cycle card start */}
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="featured-item">
                  <div className="thumb">
                    <div className="thumb-img">
                      <img src="https://source.unsplash.com/random/720×480/?cycle" alt />
                    </div>
                    {/* Two styles of add to favourites button */}
                    {/* <div class="plus-button overlay-content">
                                        <a href="team.html"><i class="fa fa-plus"></i></a>
                                    </div> */}
                    <div className="overlay-content">
                      {button}
                    </div>
                  </div>
                  <div className="down-content">
                    <h4 id="cycleName">Cycle Name : {this.state.currentCycle.allData ? this.state.currentCycle.allData.cycleName : ""}</h4>
                    <h4 id="cycleRate">Cycle Rate : {this.state.currentCycle.allData ? this.state.currentCycle.allData.cycleRate : ""}</h4>
                    <h4 id="dealerNumber">Dealer Contact Number : {this.state.currentCycle.allData ? this.state.currentCycle.allData.dealerContact[0] : ""}</h4>
                    <h4 id="bookingTime">Booking Time : {this.state.currentCycle.transaction ? new Date(this.state.currentCycle.transaction.timeStart).toLocaleString() : ""}</h4>
                    <h4 id="bookingTime">Pick Up address : {this.state.currentCycle.allData ? this.state.currentCycle.allData.cycleStoreAddress : ""}</h4>
                    <br />
                    <div className="text-button">
                      <a onClick={() => this.confirmBooking()} style={{ cursor: "pointer" }}><strong>Confirm Booking</strong></a>
                    </div>
                    <div className="text-button">
                      <a onClick={() => this.cancelBooking(this.state.currentCycle.allData.dealerId, this.state.currentCycle.allData.cycleStoreId, this.state.currentCycle.allData.cycleId)} style={{ cursor: "pointer" }}><strong>Cancel Booking</strong></a>
                    </div>
                  </div>
                </div>
              </div>
              {/* <CycleTile name="Vector91" rate={15} contact={7268998999} booking_time={(new Date()).toLocaleString()}  /> */}
            </div>
          </div>
        </section>);

      } else {
        let button;
        if (this.state.currentCycle.allData.favorite) {
          button = <button style={{ "background-color": "Orange", "color": "white" }} onClick={() => { this.deleteFavorite(this.state.currentCycle.allData.dealerId, this.state.currentCycle.allData.cycleStoreId, this.state.currentCycle.allData.cycleId) }}>Remove Favourites</button>
        } else {
          button = <button style={{ "background-color": "Orange", "color": "white" }} onClick={() => { this.addFavorite(this.state.currentCycle.allData.dealerId, this.state.currentCycle.allData.cycleStoreId, this.state.currentCycle.allData.cycleId) }}>Add Favourites</button>
        }
        currStatus = (<section className="featured-places">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-heading">
                  <span><h1>In Use Cycles</h1></span>
                  <h2 id="store-name">This is the cycle you are currently using.</h2>
                  <hr />
                </div>
              </div>
            </div>
            <div className="row">
              {/* This one element contains a card to hold one cycle*/}
              {/* Cycle card start */}
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="featured-item">
                  <div className="thumb">
                    <div className="thumb-img">
                      <img src="https://m.media-amazon.com/images/I/715wCxNPK4L._SX425_.jpg" alt />
                    </div>
                    {/* Two styles of add to favourites button */}
                    {/* <div class="plus-button overlay-content">
                                        <a href="team.html"><i class="fa fa-plus"></i></a>
                                    </div> */}
                    <div className="overlay-content">
                    </div>
                  </div>
                  {button}
                  <div className="down-content">
                    <h4 id="cycleName">Cycle Name : {this.state.currentCycle.allData ? this.state.currentCycle.allData.cycleName : ""}</h4>
                    <h4 id="cycleRate">Cycle Rate : {this.state.currentCycle.allData ? this.state.currentCycle.allData.cycleRate : ""}</h4>
                    <h4 id="dealerNumber">Dealer Contact Number : {this.state.currentCycle.allData ? this.state.currentCycle.allData.dealerContact[0] : ""}</h4>
                    <h4 id="bookingTime">Start Time : {this.state.currentCycle.transaction ? new Date(this.state.currentCycle.transaction.timeStart).toLocaleString() : ""}</h4>
                    <h4 id="bookingTime">Cost : Rs. {this.state.currentCycle.transaction ? this.state.currentCycle.transaction.cost : ""}</h4>
                    <br />
                    {/* <div className="text-button">
                            <a onClick={()=>this.confirmBooking()} style={{cursor:"pointer"}}><strong>Confirm Booking</strong></a>
                          </div>
                          <div className="text-button">
                            <a onClick={()=>this.cancelBooking()} style={{cursor:"pointer"}}><strong>Cancel Booking</strong></a>
                          </div> */}
                  </div>
                </div>
              </div>
              {/* <CycleTile name="Vector91" rate={15} contact={7268998999} booking_time={(new Date()).toLocaleString()}  /> */}
            </div>
          </div>
        </section>)

      }


    }

    let favorites = [];
    if (this.state.favorites) {

      favorites = this.state.favorites.map((favorite) => { return <CycleTile name={favorite.cycleName} address={favorite.cycleStoreAddress} contact={favorite.cycleStoreContact} rate={favorite.cycleRate} bookCycle={() => { this.bookCycle(favorite.dealerId, favorite.cycleStoreId, favorite.cycleId, favorite.cycleRate) }} addFavorite={() => { this.addFavorite(favorite.dealerId, favorite.cycleStoreId, favorite.cycleId) }} isFavorite={favorite.favorite} available={this.state.allData[favorite.dealerId][favorite.cycleStoreId][favorite.cycleId].countAvailable} deleteFavorite={() => { this.deleteFavorite(favorite.dealerId, favorite.cycleStoreId, favorite.cycleId) }} /> })

    }

    // console.log(currStatus);


    return (

      <div>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <title>IITBHU | Cycling-App</title>
        <meta name="description" content />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="css/bootstrap.min.css" />
        <link rel="stylesheet" href="css/bootstrap-theme.min.css" />
        <link rel="stylesheet" href="css/fontAwesome.css" />
        <link rel="stylesheet" href="css/hero-slider.css" />
        <link rel="stylesheet" href="css/owl-carousel.css" />
        <link rel="stylesheet" href="css/style.css" />
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,200,300,400,500,600,700,800,900" rel="stylesheet" />
        {/* Navbar start */}
        <div className="wrap">
          <header id="header">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <button id="primary-nav-button" type="button">Menu</button>

                  <nav id="primary-nav" className="dropdown cf">
                    <ul className="dropdown menu">
                      <li><Link to="/user/home">Dashboard</Link></li>
                      <li><Link to="/user/store">Store</Link></li>
                      <li><Link to="/user/profile">My Profile</Link></li>
                      <li><a onClick={() => { this.setState({ toLogin: true }) }} style={{ cursor: "pointer" }}>Logout</a></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </header>
        </div>
        {/* Navbar end */}
        {/* Banner start */}
        <section className="banner" id="top" style={{ "background-image": "url(https://source.unsplash.com/random/1920×700/?cycle)" }}>
          <div className="row">
            <div className="col-md-10 col-md-offset-1">
              <div className="banner-caption">
                <div className="line-dec" />
                <h2 style={{ "color": "White", "text-shadow": "2px 2px black" }}>Dashboard</h2>
                <div className="line-dec" />
              </div>
            </div>
          </div>
        </section>
        {/* Banner end */}
        <main>
          {/* Store section */}
          <center>
            {currStatus}
          </center>
          {/* Store section */}

          {/* Store section */}
          <section className="featured-places">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="section-heading">
                    <span><h1>Favorites</h1></span>
                    <h2 id="store-name">{favorites.length === 0 ? "OOps you do not have any favorite cycle.    Visit store to see a whole range of new cycles to ride" : "Are you ready to rent these cycles you like ?"}</h2>
                    <hr />
                  </div>
                </div>
              </div>
              <div className="row">
                {/* This one element contains a card to hold one cycle*/}

                {favorites}

                {/* Cycle card start */}

                {/* Cycle card end */}
              </div>
            </div>
          </section>
        </main>
        {/* Footer start */}
        <footer>
          <div className="container">
            <div className="row">
              <div className="col-md-5">
                <div className="about-veno">
                  <div className="logo">
                  </div>
                  <p>IITBHU Cycling App</p>
                  <ul className="social-icons">
                    <li>
                      <a href="#"><i className="fa fa-facebook" /></a>
                      <a href="#"><i className="fa fa-twitter" /></a>
                      <a href="#"><i className="fa fa-linkedin" /></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-4">
                <div className="useful-links">
                  <div className="footer-heading">
                    <h4>Rent Cycles</h4>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <ul>
                        <li><Link to="/"><i className="fa fa-stop" />Home</Link></li>
                        <li> <p><a onClick={() => { this.setState({ toLogin: true }) }} style={{ cursor: "pointer" }}>Logout</a></p></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="contact-info">
                  <div className="footer-heading">  
                    <h4>Contact Information</h4>
                  </div>
                  <p><i className="fa fa-map-marker" /> Hall 12, IITBHU</p>
                  <ul>
                    <li><span>Phone:</span><a href="#">9876543210</a></li>
                    <li><span>Email:</span><a href="#">arpit@harsh.com</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
        {/* Footer end */}
        {/* Sub footer start */}
        <div className="sub-footer">
          <p>Copyright © 2021 IITBHU-Cycling App</p>
        </div>
        {/* Sub footer end */}
      </div>

    )


  }
}

export default UserHome;