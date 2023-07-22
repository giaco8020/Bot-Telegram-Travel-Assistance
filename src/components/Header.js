import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Header = () => {
	const [isHome, setIsHome] = useState(true);
	const location = useLocation();

	useEffect(() => {
		if (location.pathname === "/") {
			setIsHome(true);
		} else {
			setIsHome(false);
		}
	}, [location]);

	return (
		<header>
            {/* conditional rendering if path is "/" or not */}
			{!isHome && (
				<Link to="/" className="back">
					&#9664;
				</Link>
			)}
			<img
				className={isHome ? "jumbo" : "jumbo-reduct"}
				src={
					isHome
						? require("../assets/jumbo.png")
						: require("../assets/jumbo-reduct.png")
				}
				alt=""
			/>
		</header>
	);
};

export default Header;
