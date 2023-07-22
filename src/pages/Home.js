import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header";

const Home = () => {
	return (
		<div className="container">
            {/* Edit meta tag here*/}
            <Helmet>
                <title>Home</title>
            </Helmet>
            {/* --- */}
			<Header />
			<main>
				<div className="grid home-grid">
					<Link className="grid-chd ricerca-v" to="/search">
						<h1 className="fs-4">RICERCA VIAGGIO</h1>
						<img
							className="i-s3-1"
							src={require("../assets/i-ticket.png")}
							alt=""
						/>
					</Link>
					<Link className="grid-chd trova-t" to="/train">
						<h1 className="fs-3">TROVA TRENO</h1>
						<img
							className="i-s3-1"
							src={require("../assets/i-train.png")}
							alt=""
						/>
					</Link>

					<Link className="grid-chd documenti-u" to="/">
						<img
							className="i-s4"
							src={require("../assets/i-document.png")}
							alt=""
						/>
						<h1 className="fs-1">DOCUMENTO TESI</h1>
					</Link>
					<Link className="grid-chd info" to="/info">
						<img
							className="i-s3-2"
							src={require("../assets/i-info.png")}
							alt=""
						/>
						<h1 className="fs-2">INFO</h1>
					</Link>
				</div>
			</main>
		</div>
	);
};

export default Home;
