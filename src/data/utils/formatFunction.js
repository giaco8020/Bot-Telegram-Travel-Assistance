const {MezzoId,Soluzione, convertTimestampToDateTime} = require("./formatClass")
const {componi_message_error} = require("../error/error-manager")


//Funzione Formattazione durata
function formattazioneDurata(timeFormat) {
    const regex = /^(\d+)h(?:\s+(\d+)m(?:in)?)?$/;
    const match = timeFormat.match(regex);

    if (match !== null) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2] || "0", 10);

        return { hours, minutes };
    } else {
        const regex2 = /^(\d+)min$/;
        const match2 = timeFormat.match(regex2);

        if (match2 !== null) {
            const minutes = parseInt(match2[1], 10);
            return { minutes };
        } else {
            throw new Error("Invalid time format: " + timeFormat);
        }
    }
}


//Confronta ora in ms
function isTimeBefore(time1, time2) {
    const parseTime = (time) => {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      const hoursMs = hours * 60 * 60 * 1000;
      const minutesMs = minutes * 60 * 1000;
      const secondsMs = seconds ? seconds * 1000 : 0;
      return hoursMs + minutesMs + secondsMs;
    };
    const time1Ms = parseTime(time1);
    const time2Ms = parseTime(time2);
    return time1Ms < time2Ms;
  }

//---------------------------Trenitalia-----------------------------------------------------------
//
//  1) Cerca Biglietto -- Ritorna un json -- Format esamina le informazioni e le riorganizza da quel json
//  2) Cerca_treno_byId -- Ritorna un json -- Format esamina le informazioni e le riorganizza da quel json
//

    //Si riferisce alla funzione 1) -- Cerca biglietto
    function Parse_trenitalia1(Json)
    {
        //Array di soluzioni da ritornare
        let soluzioni = []

        try
        {
            //Parsing soluzioni e creazione class object 
            Json.solutions.forEach(solution => {

                console.log("ao")
                console.log(formattazioneDurata(solution.solution.duration.toString()))
                console.log(solution.solution.departureTime)
                console.log(solution.solution.arrivalTime)

                try
                {
                    if(solution.solution.status === "SALEABLE")
                    {

                        soluzioni.push(new Soluzione(solution.solution.id, "TreniItalia", solution.solution.origin, solution.solution.destination, solution.solution.price.amount, formattazioneDurata(solution.solution.duration.toString()),solution.solution.departureTime,solution.solution.arrivalTime,solution.solution.status, undefined) )
                    }
                }
                catch(err1)
                {
                    console.log("[DEBUG] errore inserimento soluzione: " + err1)
                }
            });

            //console.log(soluzioni)
            return soluzioni
        }
        catch(err)
        {
            Json.solutions.forEach(solution => {
                console.log(solution.solution)
            });
            
            return componi_message_error(-5, `${err} - check ${Parse_trenitalia1.name} `, "formatFunction.js")
        }
    }

    //Si riferisce alla funzione 2) Cerca Treno
    function Parse_trenitalia2(Json)
    {
        //console.log(Json)
        try
        {
            let ritardo = false;

            if(Json.compClassRitardoLine !== "regolare_line")
            {
                ritardo = true
            }
            return new MezzoId(Json.compNumeroTreno, "TreniItalia", Json.origine, Json.destinazione, Json.stazioneUltimoRilevamento, Json.compOraUltimoRilevamento, Json.fermate, Json.compRitardo[0], ritardo)
        
        }
        catch(err)
        {
            return componi_message_error(-5, `${err} - check ${Parse_trenitalia2.name} `, "formatFunction.js")
        }
        
    }

//---------------------------FlixBus-----------------------------------------------------------
//
//  1) pianifica_viaggio(partenza, destinazione, data) -- Ritorna un json -- Format esamina le informazioni e le riorganizza da quel json
//

    //Si riferisce alla funzione 1) -- pianifica_viaggio
    function Parse_FlixBus1(Json, partenza, arrivo,ora,cambi)
    {
        let note;

        //Array di soluzioni da ritornare
        let soluzioni = []

        try
        {
            const results = Json.trips[0].results
            //console.log(results)
            for (let key in results) 
            {
                if (results.hasOwnProperty(key)) 
                {
                    const res = results[key];
                    
                    if(cambi === false && (res.uid.split(":")[0] === "direct"))
                    {
                        //console.log(isTimeBefore(ora,convertTimestampToDateTime(res.departure.date).split("@")[1]))
                        if(isTimeBefore(ora,convertTimestampToDateTime(res.departure.date).split("@")[1]) === true)
                        {
                            note = res.transfer_type + " - " + res.transfer_type_key;
                            if(res.price.total !== 0)
                            {
                                soluzioni.push(new Soluzione(res.uid, "FlixBus", partenza, arrivo, res.price.total, res.duration,res.departure.date,res.arrival.date,res.status, note) )
                            }
                        }
                    }
                    else if (cambi === true)
                    {
                        //console.log(isTimeBefore(ora,convertTimestampToDateTime(res.departure.date).split("@")[1]))
                        if(isTimeBefore(ora,convertTimestampToDateTime(res.departure.date).split("@")[1]) === true)
                        {
                            note = res.transfer_type + " - " + res.transfer_type_key;
                            if(res.price.total !== 0)
                            {
                                soluzioni.push(new Soluzione(res.uid, "FlixBus", partenza, arrivo, res.price.total, res.duration,res.departure.date,res.arrival.date,res.status, note) )
                            }
                        }
                    }

                }
            }

            //console.log(soluzioni)
            return soluzioni
        }
        catch(err)
        {
            const error = "-2 @ Error parsing solution trenitalia --- check json request -- format.js";
            console.log("[DEBUG] " + err);
            return null
        }
    }

//---------------------------Itabus-----------------------------------------------------------
//
//  1) pianifica_viaggio(partenza, destinazione, data) -- Ritorna un json -- Format esamina le informazioni e le riorganizza da quel json
//

    //Si riferisce alla funzione 1) -- pianifica_viaggio
    function Parse_Itabus1(Json,ora,cambi)
    {
        //Array di soluzioni da ritornare
        let soluzioni = []

        Json.data.outbound.routes.forEach(res => {
            let price;
            let temp;

            try
            {
                if(cambi === false && res.service_name.includes("_") === false)
                {
                    temp = res.rates;
                    if(temp.available === true && isTimeBefore(ora,convertTimestampToDateTime(res.departure_timestamp).split("@")[1]))
                    {
                        const productKeys = Object.keys(temp);
                        price = temp[productKeys[1]].price;
                        soluzioni.push(new Soluzione(res.service_name, "ItaBus", res.origin_code, res.destination.name, price, formattazioneDurata(res.travel_duration.toString()), res.departure_timestamp , res.arrival_timestamp ,res.available, undefined ) )
                    }
                }
                else if(cambi === true)
                {
                    temp = res.rates;
                    if(temp.available === true && isTimeBefore(ora,convertTimestampToDateTime(res.departure_timestamp).split("@")[1]))
                    {
                        const productKeys = Object.keys(temp);
                        price = temp[productKeys[1]].price;
                        soluzioni.push(new Soluzione(res.service_name, "ItaBus", res.origin_code, res.destination.name, price, formattazioneDurata(res.travel_duration.toString()), res.departure_timestamp , res.arrival_timestamp ,res.available, undefined ) )
                    }
                }
                                
            }
            catch(err)
            {
                console.log("[DEBUG] Parsing soluzione errore: " + err);
                console.log(res)
            }
            
        });

        return soluzioni

        
    }



export {Parse_trenitalia1,Parse_trenitalia2, Parse_Itabus1 , Parse_FlixBus1}