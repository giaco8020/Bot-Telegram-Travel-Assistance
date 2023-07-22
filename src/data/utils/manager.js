/*
    Manager = strumento che gestisce le richieste ed utilizza le API
*/

const {pianifica_viaggio_trenitalia} = require("../moduli/Treni/treni-italia-api")
const {pianifica_viaggio_itabus} = require("../moduli/Autobus/itabus-api")
const {pianifica_viaggio_flixbus} = require("../moduli/Autobus/flixbus-api")
const {ordinaSoluzioni} = require("./filter.mjs")
const {componi_message_error, success_return} = require("../error/error-manager")



//Ritorna tutte le soluzioni in treno con i parametri seguenti
async function pianifica_viaggio_treni(partenza,destinazione,data,ora,cambi,soloFrecce)
{
    var soluzioni = []
    //Check Parametri
    if(![partenza, destinazione, data, ora, cambi, soloFrecce].every(x => x !== undefined)) 
    {
        return componi_message_error(-4,`parametri essenziali funzione ${pianifica_viaggio_treni.name} `, "Manager.js" )
    }

    const trenitalia_soluzioni = await pianifica_viaggio_trenitalia(partenza,destinazione,data,ora,cambi,soloFrecce)
    
    if(trenitalia_soluzioni.success === true)
    {
        //Tutto okk!!
        var json_soluzioni = JSON.parse(trenitalia_soluzioni.object)
        //console.log(json_soluzioni)
        for (var i = 0; i < json_soluzioni.length; i++) 
        {
            soluzioni.push(json_soluzioni[i]);
        }

        //console.log("[DEBUG] Soluzioni trovate: " + soluzioni.length)
        //console.log("[DEBUG] " + soluzioni.toString())

        return success_return(soluzioni)
    }
    else if(trenitalia_soluzioni.success === false)
    {
        if( trenitalia_soluzioni.error === true )
        {
            //Errore durante il caricamento delle soluzioni trenitalia -- check log
            console.log("[DEBUG] " + trenitalia_soluzioni.message_error)
            return null
        }
        else
        {
            //Success = false ossia non è stato possibile avere un risultato, ma elaborazione okk
            console.log("[DEBUG] " + trenitalia_soluzioni.info)
            return null
        }
        
    }
    else
    {
        //Errore non gestito
        console.log("[DEBUG] Errore non gestito")
        return null
    }

}

async function pianifica_viaggi_autobus(partenza,destinazione,data,ora,cambi)
{
    let json;
    var soluzioni = []
    //Check Parametri
    if(![partenza, destinazione, data].every(x => x !== undefined)) 
    {
        return componi_message_error(-4,`parametri essenziali funzione ${pianifica_viaggi_autobus.name} `, "Manager.js" )
    }

    const flixbus_soluzioni = await pianifica_viaggio_flixbus(partenza,destinazione,data,ora,cambi) //FUNZIONA
    const itabus_soluzioni = await pianifica_viaggio_itabus(partenza,destinazione,data,ora,cambi) //FUNZIONA
    //console.log(itabus_soluzioni)
    
    if(flixbus_soluzioni.success === true)
    {
        json = JSON.parse(flixbus_soluzioni.object);
        for (let i = 0; i < json.length; i++) 
        {
            soluzioni.push(json[i])
        }
    }
    else
    {
        console.log("[DEBUG] " + flixbus_soluzioni)
    }

    
    if(itabus_soluzioni.success === true)
    {
        json = JSON.parse(itabus_soluzioni.object);
        
        for (let i = 0; i < json.length; i++) 
        {
            soluzioni.push(json[i])
        }

    }
    else
    {
        console.log("[DEBUG] " + itabus_soluzioni)
    }

    //console.log(soluzioni)
    return success_return(soluzioni)
}

//----------------------------------------------FUNZIONE ESPORTATA----------------------------------------------------------------

async function pianifica_viaggio(partenza,destinazione,data,ora,cambi,soloFrecce, filter_mezzo,filter_descr, num )
{
    /*
        Partenza = stringa -- OBBLIGATORIO
        Destinazione = stringa -- OBBLIGATORIO
        data = formato "AAAA-MM-GG" -- OBBLIGATORIO
        ora = formato "HH:MM:SS" -- OBBLIGATORIO
        cambi = Se TRUE allora si cercano soluzione con cambi altrimenti FALSE -- OBBLIGATORIO
        soloFrecce = se TRUE si cercano treni solo frecce -- OBBLIGATORIO
        
        filter.mezzo = Se si vuole scegliere il mezzo con cui si vuole viaggiare 

                        Filter_mezzo.TRAIN_ONLY
                        Filter_mezzo.BUS_ONLY

                        Se non si vuole filtrare filter_mezzo si ponga = null
        
        filter_descr -- OBBLIGATORIO

                        Filter_descr.DURATA
                        Filter_descr.PREZZO 
                        Filter_descr.BEST_SOLUTION

                        Se si vuole filtrare come durata o prezzo -- OBBLIGATORIO
        
        num = numero di soluzioni che si vuole cercare -- Se NULL tutte le soluzioni trovare vengono mostrate -- Se Filter_descr.BEST_SOLUTION allora num è indifferente 

    */


    var a1 = await pianifica_viaggio_treni(partenza, destinazione, data, ora, cambi, soloFrecce);

    try
    {
        //Errore pianifica_viaggio_treni
        if(a1.success === false && a1.error === true)
        {
            console.log("[DEBUG] " + a1.message_error)
            return a1
        }
        else if (a1.success === false && a1.error === false) //Messaggio informativo
        {
            console.log("[DEBUG] " + a1.info) //MI aspetto un array vuoto di soluzioni
        }
    }
    catch (error)
    {
        console.log("[DEBUG] ERRORE ENDPOINT TRENITALIA") //Errore endpoint trenitalia
        a1 = {object:[]}

    }

    const a2 = await pianifica_viaggi_autobus(partenza, destinazione, data, ora, cambi);

    //Errore pianifica_viaggi_autobus
    if(a2.success === false && a2.error === true)
    {
        console.log("[DEBUG] " + a2.message_error)
        return a2
    }
    else if (a2.success === false && a2.error === false) //Messaggio informativo
    {
        console.log("[DEBUG] " + a2.info) //MI aspetto un array vuoto di soluzioni
    }

    console.log(a1.object)

    let soluzioni = {};


    //Unisco le soluzioni Trovate
    if(a1.object.length === 0 && a2.object.length !== 0 )
    {
        //Nessuna soluzione trenitalia trovata
        soluzioni = JSON.parse(a2.object)
    }
    else if (a1.object.length !== 0 && a2.object.length === 0 )
    {
        soluzioni = JSON.parse(a1.object);
    }
    else
    {
        soluzioni = JSON.parse(a1.object).concat(JSON.parse(a2.object));
    }

    //Ordino le soluzione con il criterio scelto
    const sOrdinate = ordinaSoluzioni(soluzioni, filter_mezzo, filter_descr, num);

    return success_return(sOrdinate)
}

export {pianifica_viaggio}
