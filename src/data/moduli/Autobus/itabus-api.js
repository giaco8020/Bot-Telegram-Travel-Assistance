import axios from 'axios';

const {Parse_Itabus1} = require("../../utils/formatFunction")
const {componi_message_error, success_return, debugPersonalizzato} = require("../../error/error-manager.js")

//Definizione endpoint per ovviare cors error
// const noCorsError = "https://cors-anywhere.herokuapp.com/"


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

// ------------------------------------------------------------ API --------------------------------------------------------

async function ricerca_stazioni(stazioneT)
{   
    let stazione = stazioneT.replace("( Tutte Le Stazioni )", "").replace("Centrale", "").replace(/ /g, '');
    console.log(stazione)
    debugPersonalizzato("ITABUS", `Ricerca Stazione ${stazione}`)

    //Endpoint usato --> https://www.itabus.it/on/demandware.store/Sites-ITABUS-Site/it/Api-Stations
    const endpoint = `https://www.itabus.it/on/demandware.store/Sites-ITABUS-Site/it/Api-Stations`;

    const response = await axios.get(endpoint)
    .catch(function (error) {
        if (error.response) {
            // Server risponde con un status code diverso da 2**
            return componi_message_error(-1, `statusCode response [${response.status}] - check ${ricerca_stazioni.name} `, "itabus.API")
        } 
        else if (error.request) 
        {
            // Nessuna risposta ricevuta dal server
            return componi_message_error(-6, `Riprovare... - check ${ricerca_stazioni.name} `, "itabus.API")

        } 
        else 
        {
            // Errore non gestito 
            return componi_message_error(-7, ` - check ${ricerca_stazioni.name} `, "itabus.API")
        }
    
    });

    try
    {
        const data = response.data.data;
        const stations = data.filter(station => station.city === stazione);

        let oggetto = null
        let max = 0

        stations.forEach(item => {
            if(item.destinations.length >= max)
            {
                oggetto = item
                max = item.destinations.length
            }
        });

        if(oggetto === null)
        {
            return componi_message_error(-5, `check ${ricerca_stazioni.name} `, "itabus.API")
        }

        return success_return(oggetto.code)

    }
    catch(err)
    {
        console.log(err)
        return componi_message_error(-2, `[GET] - check ${ricerca_stazioni.name} `, "itabus.API")
    }
    
}


//FORMATO DATA CORRETTO --> "2023-04-19"
async function pianifica_viaggio_itabus(partenza, destinazione, data,ora,cambi)
{
    if(checkDateFormat(data) === false)
    {
        return componi_message_error(-4, `parametro data | Formato corretto 'AAAA-MM-GG' - check ${pianifica_viaggio_itabus.name} `, "itabus.API")
    }

    const code_stazione = await ricerca_stazioni(partenza)

    if(code_stazione.success === false)
    {
        //Errore
        debugPersonalizzato("ITABUS", `Errore parsing stazione partenza...Stampo errore`)
        console.log(code_stazione)

        return componi_message_error(-3, `partenza - check ${ricerca_stazioni.name} `, "itabus.API")
    }

    const code_destinazione = await ricerca_stazioni(destinazione)
    if(code_destinazione.success === false)
    {
        //ERRORE
        debugPersonalizzato("ITABUS", `Errore parsing stazione destinazione...Stampo errore`)
        console.log(code_destinazione)

        return componi_message_error(-3, `ritorno - check ${ricerca_stazioni.name} `, "itabus.API")
    }

    const t1 = code_stazione.object.replaceAll('"', "")
    const t2 = code_destinazione.object.replaceAll('"', "")

    debugPersonalizzato("ITABUS", `Stazione Partenza: ${t1}`)
    debugPersonalizzato("ITABUS", `Stazione Arrivo: ${t2}`)

    //Endpoint usato --> https://www.itabus.it/on/demandware.store/Sites-ITABUS-Site/it/Api-Travels?
    const params = `origin=${t1}&destination=${t2}&datestart=${data}&adults=1&children=0&membership=false&code=`;
    //console.log(params)
    const endpoint = "https://www.itabus.it/on/demandware.store/Sites-ITABUS-Site/it/Api-Travels?" + params;

    
    const response = await axios.get(endpoint)
    .catch(function (error) {
        if (error.response) {
            // Server risponde con un status code diverso da 2**
            return componi_message_error(-1, `statusCode response [${response.status}] - check ${pianifica_viaggio_itabus.name} `, "itabus.API")
        } 
        else if (error.request) 
        {
            // Nessuna risposta ricevuta dal server
            return componi_message_error(-6, `Riprovare... - check ${pianifica_viaggio_itabus.name} `, "itabus.API")

        } 
        else 
        {
            // Errore non gestito
            return componi_message_error(-7, ` - check ${pianifica_viaggio_itabus.name} `, "itabus.API")
        }
    
    });


    const risp = Parse_Itabus1(response.data, ora, cambi);

    //debugPersonalizzato("ITABUS", `Stampo risposta della funzione pianifica_viaggio_itabus `)
    console.log(risp)

    return success_return(risp)
}

export {pianifica_viaggio_itabus};