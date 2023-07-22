import React, {useEffect, useState} from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header";

//Importo Toast function
import toast from 'react-hot-toast';

//Importo funzioni utili per comunicazione con Server
import {cerca_treno_byId} from "../data/moduli/Treni/treni-italia-api"

const Train = () => {

	const [idTreno, setIdTreno] = useState(null);
	const [treno, setTreno] = useState(null);
	let [toastId, setToastId] = useState(null);


	const handleCercaTreno = async () => {

		if (isNaN(document.getElementById("inputIdTreno").value) || document.getElementById("inputIdTreno").value === "") {
			toast.error('Id treno non valido');
			return
		}

		setToastId(toast.loading('Loading...'));

		//setIdTreno è asincrono -- cosi ok
		setIdTreno(document.getElementById("inputIdTreno").value);
	}

	useEffect(() => {
		async function fetchData() {
			if (idTreno) {
				console.log(idTreno); // Qui idTreno è stato aggiornato correttamente

				const trenoData = await cerca_treno_byId(idTreno); // Invoca la funzione `cercaTreno` e salva il risultato nello stato

				//console.log("DEBUG" + JSON.stringify(trenoData))

				if (trenoData.success === true) {
					toast.success('Treno Rilevato ', {
						id: toastId,
					});
					setTreno(trenoData);
					//console.log(treno)
				}
				else if (trenoData.success === false && trenoData.error === false) {
					//Treno non rilevato -- id Inesistente
					toast('Treno non rilevato', {
						icon: 'ℹ️',
						id: toastId,
					});
					setTreno(null);
				}
				else if (trenoData.success === false && trenoData.error === true) {
					//Errori
					toast.error(trenoData.message_error, {
						id: toastId,
					});
					setTreno(null);
				}

				return 0
			}
		}
		fetchData();
	}, [idTreno, toastId]);

	return (
		<div className="container-reduct">
            {/* Edit meta tag here*/}
			<Helmet>
				<title>Train</title>
			</Helmet>
            {/*  */}
			<Header />
			
			<main>

				<div className="train-grid">
					
					<input
						className="fs-1"
						type="text"
						placeholder="inserire l'id del treno"
						id="inputIdTreno"
					/>
					
					<button className="fs-2" onClick={handleCercaTreno} >Cerca</button>

					{treno && (

						<div className="train-info">
							<div className="train-child id">
								<h4>ID</h4>
								<h4>{JSON.parse(treno.object).id}</h4>
							</div>

							<div className="train-child origin">
								<h4>PARTENZA</h4>
								<h4>{JSON.parse(treno.object).origin}</h4>
							</div>

							<div className="train-child destination">
								<h4>ARRIVO</h4>
								<h4>{JSON.parse(treno.object).destination}</h4>
							</div>

							<div className="train-child last-rel">
								<h4>ULTIMO RILEVAMENTO</h4>
								<h4>{JSON.parse(treno.object).ora_ultimo_rilevamento}</h4>
							</div>

							<div className="train-child delay">
								<h4 className="time">RITARDO </h4>
								{JSON.parse(treno.object).ritardo ? (
									<div className="indicator true-d ">{JSON.parse(treno.object).note.split(" ")[1].replace(".", "")+"m"}</div>
								) : (
									<div className="indicator false-d ">    </div>
								)}
							</div>

							<div className="train-child note">
								<h4>NOTE</h4>
								<h4>{JSON.parse(treno.object).note}</h4>
							</div>


						</div>
					)}



				</div>
			</main>
		</div>
	);
};

export default Train;
