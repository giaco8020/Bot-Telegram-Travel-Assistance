import axios from 'axios';

const {Parse_trenitalia1,Parse_trenitalia2} = require("../../utils/formatFunction")
const {componi_message_error, success_return,debugPersonalizzato} = require("../../error/error-manager.js")

//Definizione endpoint per ovviare cors error
//const noCorsError = "https://cors-anywhere.herokuapp.com/"


//Converte data/ora in formato ISO --> Utile per generare date_time come parametro di richiesta in cerca_biglietto()
function convert_to_iso(data, ora) {
    const date_obj = new Date(data);
    const time_obj = new Date(`1970-01-01T${ora}Z`);

    const dt_obj = new Date(date_obj.getFullYear(), date_obj.getMonth(), date_obj.getDate(), time_obj.getUTCHours(), time_obj.getUTCMinutes(), time_obj.getUTCSeconds());

    const iso_str = dt_obj.toISOString().slice(0, -1) + "+02:00";

    return iso_str;
}
  
//Funzione che controlla se data ed ora hanno questo formato "AAAA-MM-GG", "HH:MM:SS"
function controllaFormatoDataOra(data, ora) 
{
    const formatoDataRegex = /^\d{4}-\d{2}-\d{2}$/;
    const formatoOraRegex = /^\d{2}:\d{2}:\d{2}$/;

    if (!formatoDataRegex.test(data)) {
        return false;
    }
    return formatoOraRegex.test(ora);

}

//Funzione che ritorna il timestamp attuale in formato "HH:MM:SS"
function getCurrentTime() {
    let now = new Date();
    let hours = ("0" + now.getHours()).slice(-2);
    let minutes = ("0" + now.getMinutes()).slice(-2);
    let seconds = ("0" + now.getSeconds()).slice(-2);
    return hours + ":" + minutes + ":" + seconds;
}

// ------------------------------------------------------------ API --------------------------------------------------------

//Funzione appoggio cerca-biglietto --> Permette di ricercare idStazione dato il nome di una stazione
async function ricerca_stazioni(stazioneT, check) {

    //Controllo parametri valore d'ingresso
    if(stazioneT == null)
    {
        return componi_message_error(-4,"parametro 'stazione' ", ricerca_stazioni.name)
    }

    var stazione = stazioneT

    if(check === true)
    {
        //Sostituisco lo spazio con %20 per i parametri dell'url
        stazione = stazioneT.replace(/\s/g, '%20');
    }


    //Endpoint usato --> https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=NomeStazione
    const endpoint = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name=" + stazione;

    try 
    {
        const response = await axios.get(endpoint)
        .catch(function (error) 
        {
            if (error.response) 
            {
                // Server risponde con un status code diverso da 2**
                return componi_message_error(-1, `statusCode response [${response.status}] - check ${ricerca_stazioni.name} `, "treniItalia.API")
            } 
            else if (error.request) 
            {
                // Nessuna risposta ricevuta dal server
                return componi_message_error(-6, `Riprovare... - check ${ricerca_stazioni.name} `, "treniItalia.API")
            
            } 
            else 
            {
                // Errore non gestito 
                return componi_message_error(-7, ` - check ${ricerca_stazioni.name} `, "treniItalia.API")
            }
      
        });
        
        const jsonEndpoint = response.data;
        
        if (jsonEndpoint.length === 0) {
        
            return componi_message_error(1, `inserisce una stazione valida...  - check ${ricerca_stazioni.name}`,"treniItalia.API")
        
        }

        //Se check === true allora usiamo la funzione per autocompletamento senno la uso per cercare id stazione per modulo trenitalia
        if(check === true)
        {
            //console.log(success_return(jsonEndpoint))
            return success_return(jsonEndpoint)
        }
        else
        {
            try
            {
                var stazioneSelezionata = jsonEndpoint[0].id;
            }
            catch (error)
            {
                return componi_message_error(3, `- check ${ricerca_stazioni.name}`, "treniItalia.API")
            }

            //console.log(`[DEBUG] Partenza Selezionata --> ${stazioneSelezionata}`);
            return success_return(stazioneSelezionata);
        }



    }
    catch (error)
    {
        return componi_message_error(-2, `[GET] - check ${ricerca_stazioni.name}`, "treniItalia.API")
    }
}

async function pianifica_viaggio_trenitalia(partenza, arrivo, data, ora, cambi, soloFrecce) {
    
    //Check parametri d'ingresso
    if(![partenza, arrivo, data, ora, cambi, soloFrecce].every(x => x !== undefined)) 
    {
      return componi_message_error(-4,`parametri essenziali funzione ${pianifica_viaggio_trenitalia.name} `, "treniItalia.API" )
    }

    let c = cambi;
    let s = soloFrecce;
    let o = ora;

    if(ora == null)
    {
      o = getCurrentTime()
    }

    // Controlla Formato data ed ora 
    //Formato corretto --> 'AAAA-MM-GG', 'HH:MM:SS'
    if(controllaFormatoDataOra(data, o) === false)
    {
      return componi_message_error(-4,`parametri data e/o ora | Formato corretto 'AAAA-MM-GG', 'HH:MM:SS' - check ${pianifica_viaggio_trenitalia.name}`, "treniItalia.API" )
    }

    if(cambi == null || soloFrecce == null)
    {
      c = false;
      s = false;
    }

    //Prendo idStazione Partenza
    const idPartenza = await ricerca_stazioni(partenza, false);
    if (idPartenza.success === "false")
    {
        debugPersonalizzato("TRENITALIA", `impossibile ottenere idPartenza`)
        return componi_message_error(-3,`partenza - ${pianifica_viaggio_trenitalia.name}`, "treniItalia.API" )
    }

    //Prendo idStazione Arrivo
    const idArrivo = await ricerca_stazioni(arrivo, false);
    if (idArrivo.success === "false")
    {
        debugPersonalizzato("TRENITALIA", `impossibile ottenere idArrivo`)
        return componi_message_error(-3,`arrivo - ${pianifica_viaggio_trenitalia.name}`, "treniItalia.API" )
    }

    if (typeof cambi != "boolean" && typeof soloFrecce != "boolean") 
    {
        return componi_message_error(-4,`variabili cambi e/o soloFrecce devono essere boolean - ${pianifica_viaggio_trenitalia.name}`, "treniItalia.API" )
    }

    //endpoint usato --> https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions
    const endpoint = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions";

    //Conversione data/ora in formato ISO
    let iso_datetime = convert_to_iso(data, o);

    //Payload per richiesta POST
    const json_payload = {
      departureLocationId: idPartenza.object.toString(),
      arrivalLocationId: idArrivo.object.toString(),
      departureTime: iso_datetime,
      adults: 1,
      children: 0,
      criteria: {
        frecceOnly: s,
        regionalOnly: false,
        noChanges: c,
        order: "DEPARTURE_DATE",
        limit: 10,
        offset: 0,
      },
      advancedSearchRequest: {
        bestFare: false,
      },
    };

    try 
    {
      const requestEndpoint = await axios.post(endpoint, json_payload)
      .catch(function (error) {
        if (error.response) 
        {
            // Server risponde con un status code diverso da 2**
            return componi_message_error(-1, `statusCode response [${requestEndpoint.status}] - check ${pianifica_viaggio_trenitalia.name} `, "treniItalia.API")
        } 
        else if (error.request) 
        {
            // Nessuna risposta ricevuta dal server
            return componi_message_error(-6, `Riprovare... - check ${pianifica_viaggio_trenitalia.name} `, "treniItalia.API")

        } 
        else 
        {
            // Errore non gestito 
            return componi_message_error(-7, ` - check ${pianifica_viaggio_trenitalia.name} `, "treniItalia.API")
        }
    
      });


        const jsonEndpoint = requestEndpoint.data;
        console.log(jsonEndpoint)
        if (jsonEndpoint.length === 0)
        {
            return componi_message_error(-5, ` - ${pianifica_viaggio_trenitalia.name}]`, "treniItalia.API")
        }

        //Gestire errori endpoint
        try
        {
            var arraySoluzioni = Parse_trenitalia1(requestEndpoint.data);
            console.log(arraySoluzioni)
            return success_return(arraySoluzioni)
        }
        catch(error)
        {
            console.log(error)
            if (jsonEndpoint.hasOwnProperty("type")) {
                if (jsonEndpoint.type === "ERROR") {
                    console.log(jsonEndpoint.message)
                }
            }
        }

        return componi_message_error(4, "Riprovare..." , "treniItalia.API")



    } 
    catch (error) 
    {
        return componi_message_error(-2, `[POST] - check ${ricerca_stazioni.name}`, "treniItalia.API")
    }
}

function getTrainInfo(data) {
    const currentDate = new Date().toLocaleDateString('it-IT'); // ottieni la data corrente in formato GG/MM/AA
    let currentLine = null;

    // cerca la riga contenente la data corrente
    for (const line of data.split('\n')) {
        if (line.includes(currentDate)) {
            currentLine = line;
            break;
        }
    }

    // se non hai trovato la riga con la data corrente, prendi l'ultima riga
    if (!currentLine) {
        const lines = data.trim().split('\n');
        currentLine = lines[lines.length - 1];
    }

    const tokens = currentLine.split('|')[1].split('-');
    const idTreno = tokens[1];
    const uuidTreno = tokens[2];

    return { idTreno, uuidTreno };
}


async function cerca_treno_byId(numeroTreno) {



    if (isNaN(numeroTreno))
    {
      //console.log("[DEBUG] typeof 'numeroTreno' --> " + typeof(numeroTreno))
      return componi_message_error(-4, `numeroTreno deve essere un parametro INTERO - check ${cerca_treno_byId.name}`, "treniItalia.API")
    }

    //Endpoint usato --> http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete
    const endpoint = "http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/cercaNumeroTrenoTrenoAutocomplete/";

    try 
    {
        const pageToken = await axios.get(endpoint+numeroTreno);

        if (pageToken.status !== 200) 
        {
          return componi_message_error(-1, `statusCode response [${pageToken.status}]- check ${cerca_treno_byId.name}`, "treniItalia.API")
        }

        console.log(pageToken.data)

        try
        {
            var { idTreno, uuidTreno } = getTrainInfo(pageToken.data)

        }
        catch(error)
        {
          return componi_message_error(2, `statusCode response [${pageToken.status}]`, cerca_treno_byId.name + " - treniItalia.API")
        }

        const url_mainPage = `http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/${idTreno}/${numeroTreno}/${uuidTreno}`;
        
        const mainPage = await axios.get(url_mainPage)
        .catch(function (error) {
          if (error.response) 
          {
              // Server risponde con un status code diverso da 2**
              return componi_message_error(-1, `statusCode response [${mainPage.status}] - check ${cerca_treno_byId.name} `, "treniItalia.API")
          } 
          else if (error.request) 
          {
              // Nessuna risposta ricevuta dal server
              return componi_message_error(-6, `Riprovare... - check ${cerca_treno_byId.name} `, "treniItalia.API")
  
          } 
          else 
          {
              // Errore non gestito 
              return componi_message_error(-7, ` - check ${cerca_treno_byId.name} `, "treniItalia.API")
          }
      
        });
    
        console.log("[DEBUG] " + url_mainPage);
        const m = Parse_trenitalia2(mainPage.data)

        console.log(m)

        if(m.success === false)
        {
            return m
        }

        return success_return(m)

    } 
    catch (error) 
    {
        console.log(error)
        return componi_message_error(-2, `[GET] - check ${cerca_treno_byId.name}`, "treniItalia.API")
    }
}


export {pianifica_viaggio_trenitalia , cerca_treno_byId, ricerca_stazioni};