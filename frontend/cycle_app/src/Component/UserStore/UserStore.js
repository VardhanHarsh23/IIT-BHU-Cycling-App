// import { profile } from 'console';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
// import NavBar from './navBar';
// import CycleStore from './cycleStore';
// import CurStatus from './curStatus';

import "./css/bootstrap.min.css";
import "./css/bootstrap-theme.min.css";
import "./css/fontAwesome.css";
import "./css/hero-slider.css";
import "./css/owl-carousel.css";
import "./css/style.css";
import CycleStore from './CycleStore';
// import CycleTile from './cycleTile';


class UserStore extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            userId: localStorage.getItem("userId"),
            token: `Bearer ${localStorage.getItem("token")}`,
            toLogin: false,
            // allData:{}, // Stores all the data corresponding to all dealers, cycleStores and cycles. Initialized in component did mount
            favorites: [], // allData[dealerId][cycleStoreId][cycleId]
            // currentCycle:{}, // currentCycle :{transaction:{}, allData:{Stores data of currently booked/ in use cycle}}
            cycleStore: {}
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

            let res = await fetch('http://localhost:5000/user/viewCycle', req);
            let response = await res.json();
            console.log("response ", response);


            if (res.status === 200) {

                // this.setState({cycleStore:response});

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

                if (res.status === 200) {


                    this.setState({ cycleStore: response, favorites: response2.data });

                } else {

                    this.setState({ toLogin: true });

                }

            } else {

                this.setState({ toLogin: true });

            }





        } catch (err) {

            console.log(err);
            alert(err);

        }

    }



    changeShow(cycleStoreId) {

        let cycleStore = this.state.cycleStore;
        cycleStore[cycleStoreId].show = !cycleStore[cycleStoreId].show;
        this.setState({ cycleStore: cycleStore });

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

        let jsx = [];
        let cycleStore = this.state.cycleStore;


        if (cycleStore) {

            // console.log(cycleStore);
            for (let i in this.state.cycleStore) {


                jsx.push(<CycleStore token={this.state.token} cycleStoreId={i} allData={cycleStore[i]} onClick={() => { this.changeShow(i) }} />)

            }

        }



        return (<div>

            <meta charset="utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <title>IITBHU | Cycling-App</title>

            <meta name="description" content="" />
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

            <section className="banner" id="top" style={{ "background-image": "url(https://source.unsplash.com/random/1920×700/?cycle)" }}>
                <div className="row">
                    <div className="col-md-10 col-md-offset-1">
                        <div className="banner-caption">
                            <div className="line-dec" />
                            <h2 style={{ "color": "White", "text-shadow": "2px 2px black" }}>Store</h2>
                            <div className="line-dec" />
                        </div>
                    </div>
                </div>
            </section>

            <main>
                {/* Section to contain a single store with cycle */}
                <section id="store">
                    <h1 className="section-heading" style={{ "font-size": "40px" }}>Stores</h1>
                    {jsx}
                </section>
                {/* Store Section end */}

            </main>
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


        </div>)

    }
}

export default UserStore;