import axios from 'axios';

const {Parse_FlixBus1} = require("../../utils/formatFunction")
const {componi_message_error, success_return, debugPersonalizzato} = require("../../error/error-manager.js")

//Definizione endpoint per ovviare cors error
//const noCorsError = "https://api.allorigins.win/raw?url="

//Check formato data corretto -- 'AAAA-MM-GG'
function checkDateFormat(dateString) {
    // RegEx per verificare il formato della data: AAAA-MM-GG
    const regex = /^\d{4}-\d{2}-\d{2}$/;
  
    // Controlla se la stringa della data corrisponde al formato atteso
    if (!regex.test(dateString)) 
    {
      return false;
    }
    return true;
}

//Funzione per trasformare il formato da 'AAAA-MM-GG' -------> "GG.MM.AAAA"
function trasformaData(dataAaaaMmGg) {
    // rimuovi i trattini dalla data iniziale
    dataAaaaMmGg = dataAaaaMmGg.replace(/-/g, "");
    
    // estrai anno, mese e giorno dalla data iniziale
    const anno = dataAaaaMmGg.substr(0, 4);
    const mese = dataAaaaMmGg.substr(4, 2);
    const giorno = dataAaaaMmGg.substr(6, 2);

    // costruisci la data nel formato desiderato
    // restituisci la data nel formato desiderato
    return giorno + "." + mese + "." + anno;
}



// ---------------------------------------------------API------------------------------------------------------------------------------

async function ricerca_stazioni(stazioneT)
{

    let stazione = stazioneT.replace("( Tutte Le Stazioni )", "")

    //Endpoint usato --> https://global.api.flixbus.com/search/autocomplete/cities
    const endpoint = `https://global.api.flixbus.com/search/autocomplete/cities?q=${stazione}&lang=it&country=it&flixbus_cities_only=true`;

    const response = await axios.get(endpoint)
    .catch(function (error) {
        if (error.response) {
            // Server risponde con un status code diverso da 2**
            return componi_message_error(-1, `statusCode response [${response.status}] - check ${ricerca_stazioni.name} `, "flixbus.API")
        } 
        else if (error.request) 
        {
            // Nessuna risposta ricevuta dal server
            return componi_message_error(-6, `Riprovare... - check ${ricerca_stazioni.name} `, "flixbus.API")

        } 
        else 
        {
            // Errore non gestito 
            return componi_message_error(-7, ` - check ${ricerca_stazioni.name} `, "flixbus.API")
        }
    
    });

    try
    {
        const arrayStazioni = response.data;
        var partenza = arrayStazioni[0]; //Becco il risultato con lo score piu alto
        //Nel loro algoritmo mettono come primi risultati quelli piu coerenti e con piu mete dove puoi andare
    }
    catch(err)
    {
        return componi_message_error(-2, `[GET] - check ${ricerca_stazioni.name} `, "flixbus.API")
    }

    return success_return(partenza)
}


//Sintassi data --> "AAAA-MM-GG"
async function pianifica_viaggio_flixbus(partenza, destinazione, data,ora,cambi)
{

    if(checkDateFormat(data) === false)
    {
        return componi_message_error(-4, `parametro data | Formato corretto 'AAAA-MM-GG' - check ${pianifica_viaggio_flixbus.name} `, "flixbus.API")
    }

    const d = trasformaData(data);

    //Prendo id_stazione_partenza
    const id_stazione = await ricerca_stazioni(partenza)
    const id_destinazione = await ricerca_stazioni(destinazione)

    if(id_stazione.success === false)
    {
        //Errore
        debugPersonalizzato("FLIXBUS", `Errore parsing stazione partenza...Stampo errore`)
        debugPersonalizzato("FLIXBUS", `${id_stazione}`)

        return componi_message_error(-3, `partenza - check ${ricerca_stazioni.name} `, "flixbus.API")
    }

    if(id_destinazione.success === false)
    {
        //Errore
        debugPersonalizzato("FLIXBUS", `Errore parsing stazione arrivo...Stampo errore`)
        debugPersonalizzato("FLIXBUS", `${id_destinazione}`)

        return componi_message_error(-3, `partenza - check ${ricerca_stazioni.name} `, "flixbus.API")
    }

    const jsonStazione1 = JSON.parse(id_stazione.object)
    const jsonStazione2 = JSON.parse(id_destinazione.object)

    debugPersonalizzato("FLIXBUS", `Stazione Partenza: ${jsonStazione1.name} --> ${jsonStazione1.id}}`)
    debugPersonalizzato("FLIXBUS", `Stazione Partenza: ${jsonStazione2.name} --> ${jsonStazione2.id}}`)

    //Endpoint usato --> https://global.api.flixbus.com/search/service/v4/search? (GET) 

    const params = `from_city_id=${jsonStazione1.id}&to_city_id=${jsonStazione2.id}&departure_date=${d}&products=%7B%22adult%22%3A1%7D&currency=EUR&locale=it&search_by=cities&include_after_midnight_rides=1`;
    const endpoint = "https://global.api.flixbus.com/search/service/v4/search?" + params;

    //console.log(endpoint)

    const response = await axios.get(endpoint)
    .catch(function (error) {
        if (error.response) {
            // Server risponde con un status code diverso da 2**
            return componi_message_error(-1, `statusCode response [${response.status}] - check ${pianifica_viaggio_flixbus.name} `, "flixbus.API")
        } 
        else if (error.request) 
        {
            // Nessuna risposta ricevuta dal server
            return componi_message_error(-6, `Riprovare... - check ${pianifica_viaggio_flixbus.name} `, "flixbus.API")

        } 
        else 
        {
            // Errore non gestito 
            return componi_message_error(-7, ` - check ${pianifica_viaggio_flixbus.name} `, "flixbus.API")
        }
    
    });


    const sol = Parse_FlixBus1(response.data, partenza, destinazione, ora, cambi);
    debugPersonalizzato("FLIXBUS", `Soluzioni Trovate:`)
    console.log(sol)

    return success_return(sol)
}



export {pianifica_viaggio_flixbus};

