//Messaggi di errori possibili
var messaggi_errori = {
    "-1" : "Errore status code richiesta ",
    "-2" : "Richiesta endpoint fallita",
    "-3" : "Impossibile trovare la stazione di ",
    "-4" : "Errore inserimento parametri d'ingresso",
    "-5" : "Errore elaborazione contenuto risposta",
    "-6" : "Nessuna risposta da parte del server",
    "-7" : "Errore non gestito",
}   

//Messaggi di info possibili
var messaggi_info = {

    "1" : "Stazione non esistente",
    "2" : "Treno non rilevato",
    "3" : "Errore durante il parsing della stazione",
    "4" : "Non ci sono soluzioni per criteri selezionati"
}

function componi_message_error(num,descrizione, nomeFunzione)
{
    let result = {}
    if(num < 0)
    {
        //Errore
        result.success = false
        result.error = true
        result.error_code = num
        result.message_error = messaggi_errori[num] + " --- " + descrizione + " - " +  nomeFunzione 
        result.info = null
    }
    else
    {
        //Messaggio informativo
        result.success = false
        result.error = false
        result.error_code = null
        result.message_error = null
        result.info = messaggi_info[num] + " --- " + descrizione 
    }
    
    return result
}

//Funzione per incapsulare il contenuto dell'oggetto in json cosi da gestire meglio success/error operazioni
function success_return(oggetto)
{
    let result = {}
    result.success = true
    result.object = JSON.stringify(oggetto)
    return result
}

const debugAttivo = true
function debugPersonalizzato(api, messaggio )
{
    if(debugAttivo === true)
    {
        console.log(`[DEBUG][${api}]: ${messaggio} `)
    }

}

export  {componi_message_error, success_return, debugPersonalizzato};