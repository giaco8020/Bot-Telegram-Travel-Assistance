import { Routes, Route } from "react-router-dom";
import {useEffect} from "react";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Result from "./pages/Result";
import Search from "./pages/Search";
import Train from "./pages/Train";
import "@fontsource/rowdies"
import "@fontsource/rubik"
import "./style/style-master.css";

//Importo Toast function
import { Toaster } from 'react-hot-toast';

const tele = window.Telegram.WebApp

const App = () => {

	useEffect(() => {
		tele.ready()
	})

	return (

		<>
			<div>
				<Toaster
				position="top-center"
				reverseOrder={false}
				/>
			</div>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/info" element={<Info />} />
                <Route path="/result" element={<Result />} />
                <Route path="/search" element={<Search />} />
                <Route path="/train" element={<Train />} />
			</Routes>
		</>
	);
};

export default App;
