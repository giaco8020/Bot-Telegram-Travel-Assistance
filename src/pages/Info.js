import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import toast from "react-hot-toast";

const Home = () => {

	function RecapStatoAttivita()
	{
		toast.error("Da implementare")
	}

	return (
		<div className="container-reduct">
            {/* Edit meta tag here*/}
			<Helmet>
				<title>Info</title>
			</Helmet>
            {/* --- */}
			<Header />
			<main>
				<div className="grid info-grid ">
					<div className="info-box grid-chd fs-2">
						<h3>Autore:</h3>
						<p>Giacomo Vigarelli</p>

						<h3>Tesi:</h3>
						<p>
							Bot Telegram per Applicazioni di Travel Assistance in Node.js
						</p>
					</div>
					<a className="function-activity grid-chd"  onClick={RecapStatoAttivita} >
						<img
							className="i-s3-1"
							src={require("../assets/i-statistic.png")}
							alt=""
						/>
						<h2 className="fs-2-1">STATO DI ATTIVITA`</h2>
					</a>
					<a className="report grid-chd" >
						<img
							className="i-s4"
							src={require("../assets/i-new-req.png")}
							alt=""
						/>
						<h2 className="fs-2">REPORT</h2>
					</a>
					<a className="feedback grid-chd">
						<img
							className="i-s4"
							src={require("../assets/i-feed.png")}
							alt=""
						/>
						<h2 className="fs-2">FEEDBACK</h2>
					</a>
				</div>
			</main>
		</div>
	);
};

export default Home;
