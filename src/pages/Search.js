import React, {useState} from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

import {pianifica_viaggio} from "../data/utils/manager"
import {Soluzione} from "../data/utils/formatClass"
import {Filter_mezzo,Filter_descr} from "../data/utils/filter.mjs"


import {ricerca_stazioni} from "../data/moduli/Treni/treni-italia-api"
import toast from "react-hot-toast";

const Search = (props) => {

	const navigate = useNavigate();

	async function autocompletamentoStazioni(event)
	{
		event.preventDefault()

		const nomeElemento = event.target.name;
		const valoreInput = event.target.value;


		if (valoreInput.length <= 2) {
			return null
		}

		//Pulisci i suggerimenti di prima
		document.getElementById("suggestionaPartenza").innerHTML = '';
		document.getElementById("suggestionaArrivo").innerHTML = '';

		const jsonStazioni = await ricerca_stazioni(valoreInput, true)

		console.log(jsonStazioni)

		if(jsonStazioni.success === false)
		{
			//Errore durante richiesta di autocompletamento

			if(jsonStazioni.error === true)
			{
				toast.error(jsonStazioni.message_error)
			}
			else
			{
				toast.error(jsonStazioni.info)
			}

			return {success:false}
		}
		else
		{
			let elementi = JSON.parse(jsonStazioni.object)

			for (let i = 0; i < elementi.length; i++) {
				let temp = document.createElement("option");

				temp.innerHTML = elementi[i].name;

				if (nomeElemento === "arrivo") {
					document.getElementById("suggestionaArrivo").appendChild(temp);
				} else if (nomeElemento === "partenza") {
					document.getElementById("suggestionaPartenza").appendChild(temp);
				}
			}

			return {success:true}
		}

	}


	//Torna True se almeno uno è selezionato
	//Falso altrimenti
	function getCheckboxSelezionate() {
		const checkboxes = document.querySelectorAll('input[type="checkbox"][name="trasporti"]');
		let checkboxSelezionate = [];

		checkboxes.forEach(function (checkbox) {
			if (checkbox.checked) {
				checkboxSelezionate.push(checkbox.id);
			}
		});

		if (checkboxSelezionate.length === 0) {
			return null; // Nessuna checkbox selezionata
			// Oppure puoi restituire un messaggio personalizzato
			// return "Nessuna checkbox selezionata";
		}

		return checkboxSelezionate;
	}

	//Torna True se almeno uno è selezionato
	//Falso altrimenti
	function isDateTimeValid(event)
	{
		const data = document.querySelector('input[name="data"]').value;
		const orario = document.querySelector('input[name="orario"]').value;

		if (!data || !orario) {
			return false
		}

		const selectedDate = new Date(data + "T" + orario);
		const currentDate = new Date();


		if (selectedDate <= currentDate) {

			return false;
		}
		else {

			return true;
		}
	}

	function getIdRadioSelezionato() {
		var radioButtons = document.querySelectorAll('input[name="mezzi"]');

		for (var i = 0; i < radioButtons.length; i++) {
			if (radioButtons[i].checked) {
				return radioButtons[i].id;
			}
		}

		return null; // Nessun radio button selezionato
	}
	function calcolaDifferenzaInSecondi(timestamp1, timestamp2) {
		// Calcola la differenza in millisecondi
		var differenzaMillisecondi = Math.abs(timestamp1 - timestamp2);

		// Converti la differenza in secondi
		var differenzaSecondi = (differenzaMillisecondi / 1000).toFixed(3);

		return parseFloat(differenzaSecondi);
	}


	async function startRicerca() {

		//Start cronometro
		const start = new Date().getTime();

		let toastId = toast.loading('Loading...');

		/*             CHECK ORDINA                 */
		let idRadioButton = getIdRadioSelezionato()
		if (idRadioButton === null) {
			toast.error('Selezionare opzione ordina', {
				id: toastId,
			});
			return null
		}

		/*             CHECK TRASPORTI                 */
		let idCheckBox = getCheckboxSelezionate()
		if (idCheckBox === null) {
			toast.error('Selezionare opzione trasporti', {
				id: toastId,
			});
			return null
		}

		if (isDateTimeValid() === false) {
			toast.error('Inserire una data e/o ora valida ', {
				id: toastId,
			});
			return null
		}

		if (document.getElementById('inputPartenza').value === '' || document.getElementById('inputArrivo').value === '') {
			toast.error('Inserisci Partenza e/o Arrivo', {
				id: toastId,
			});
			return null
		}

		//Prendo parametri

		let partenza = document.getElementById("inputPartenza").value
		let arrivo = document.getElementById("inputArrivo").value

		//Data
		let dataInput = document.querySelector('input[name="data"]').value;
		let data = new Date(dataInput);
		const dataFormattata = data.toISOString().split('T')[0];

		//Ora
		let orarioInput = document.querySelector('input[name="orario"]').value;
		const orario = orarioInput + ":00";

		//Cambi
		let cambi = true
		if(document.getElementById("senzaCambi").checked === true)
		{
			cambi = false
		}

		//Solo frecce
		let soloFrecce = false
		if(document.getElementById("soloFrecce").checked === true)
		{
			soloFrecce = true
		}

		//FilterMezzo
		let filterMezzo = null
		if(idCheckBox.length === 1 && idCheckBox[0] === "treno")
		{
			filterMezzo = Filter_mezzo.TRAIN_ONLY
		}
		else if(idCheckBox.length === 1 && idCheckBox[0] === "autobus")
		{
			filterMezzo = Filter_mezzo.BUS_ONLY
		}

		//FilterDescrizione
		let filter = null
		if(idRadioButton === "prezzo")
		{
			filter = Filter_descr.PREZZO
		}
		else if(idRadioButton === "durata")
		{
			filter = Filter_descr.DURATA
		}
		else
		{
			filter = Filter_descr.BEST_SOLUTION
		}

		console.log("[PARTENZA]: " + partenza)
		console.log("[ARRIVO]: " + arrivo)
		console.log("[DATA]: " + dataFormattata)
		console.log("[ORA]: " + orario)
		console.log("[CAMBI]: " + cambi)
		console.log("[SOLOFRECCE]: " + soloFrecce)
		console.log("[Filter]: " + filter)


		const risultati = await pianifica_viaggio(partenza,arrivo,dataFormattata,orario,cambi,soloFrecce, filterMezzo,filter, null)

		if(risultati.success === true)
		{
			const finish = new Date().getTime();
			const diff = calcolaDifferenzaInSecondi(start,finish)

			//TUTTO OK
			toast.success(`Risultati Trovati in ${diff}s`, {
				id: toastId,
			});

			console.log("Tempo esecuzione: " + diff)
			console.log("DEBUG RISULTATI")
			console.log(JSON.parse(risultati.object))

			//Vado ad un altra pagina

			navigate('/result', { state: { risultati: JSON.parse(risultati.object)} } );
		}
		else if(risultati.error === true)
		{
			toast.error(risultati.message_error, {
				id: toastId,
			});
		}
		else if(risultati.info === true)
		{
			toast.error(risultati.info, {
				id: toastId,
			});
		}


	}

	return (
		<div className="container-reduct">
            {/* Edit meta tag here*/}
			<Helmet>
				<title>Search</title>
			</Helmet>
            {/*  */}
			<Header />
			<main>
				<div className="grid search-grid">
					<div className="grid-chd transport-filter">
						<div className="sub-cube">
							<h3>TRANSPORTI</h3>
							<ul>
								<li><input type="checkbox" name="trasporti" id="autobus" /> AUTOBUS</li>
								<li><input type="checkbox" name="trasporti" id="treno" /> TRENO</li>
							</ul>
						</div>
						<div className="sub-cube">
							<h3>OPZIONI</h3>
							<ul>
								<li><input type="checkbox" name="" id="soloFrecce"/> SOLO FRECCE</li>
								<li><input type="checkbox" name="" id="senzaCambi"/> SENZA CAMBI</li>
							</ul>
						</div>
					</div>
					<div className="grid-chd order-filter">
						<h3>ORDINA</h3>
						<ul>
							<li>
								<input type="radio" name="mezzi" id="prezzo" /> PREZZO
							</li>
							<li>
								<input type="radio" name="mezzi" id="durata" /> DURATA
							</li>
							<li>
								<input type="radio" name="mezzi" id="best" /> BEST
								SOLUTION
							</li>
						</ul>
					</div>
					<div className=" input-box">
						<div className="input-form grid-chd fs-2">
							<label htmlFor="partenza">PARTENZA:</label>

							<input type="text" name="partenza" id="inputPartenza" autoComplete="off" list="suggestionaPartenza" onChange={autocompletamentoStazioni}/>

							<datalist id="suggestionaPartenza">
							</datalist>

							<label htmlFor="arrivo">ARRIVO:</label>
							<input type="text" name="arrivo" id="inputArrivo" autoComplete="off" list="suggestionaArrivo" onChange={autocompletamentoStazioni} />

							<datalist id="suggestionaArrivo">
							</datalist>

							<label htmlFor="data">DATA:</label>
							<input type="date" name="data" id="" />
							<label htmlFor="orario">ORARIO:</label>
							<input type="time" name="orario" id="" />
						</div>
						<button className="confirm-btn grid-chd fs-3" onClick={startRicerca}>
							RICERCA
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Search;
