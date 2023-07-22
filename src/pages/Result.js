import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import CardRisultato from "../components/CardRisultato";

import { useLocation } from 'react-router-dom';

const Result = () => {
	const location = useLocation();

	let risultati = [];
	try {
		risultati = location.state.risultati;
	} catch (error) {
		console.error('Props non disponibili');
		// Puoi eventualmente gestire l'errore visualizzando un messaggio o reindirizzando l'utente a una pagina di errore
	}

	return (
		<div className="container-reduct">
			<Helmet>
				<title>Result</title>
			</Helmet>
			<Header />

			<main>
				<div className="result-grid">
					{Array.isArray(risultati) ? (
						risultati.map((risultato) => (
							<CardRisultato key={risultato.id} risultato={risultato} />
						))
					) : (
						
						<p>ERRORE</p>

					)}
				</div>
			</main>
		</div>
	);
};

export default Result;
