
//---------------------------------------------- Funzioni Utili ----------------------------------------------------------------

    //Conversione timestamp in data ed ora per parsing dati - Class Soluzione
    function convertTimestampToDateTime(timestamp) 
    {
        try
        {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const dateTime = `${day}/${month}/${year}@${hours}:${minutes}`;
            return dateTime;
        }
        catch(error)
        {
            console.log("[DEBUG] Error parsing timestamp -- check timestamp")
            return null;
        }
        
    }

//---------------------------------------------- Classe Mezzoid ---------------------------------------------------------------

//Classe che permette di immagazzinare un mezzo e richiamare medoti utili per visualizzazione 
class MezzoId
{
    constructor(id,provider, origin, destination,ultimo_rilevamento, ora_ultimo_rilevamento, fermate, note, ritardo)
    {
        if(provider.toLowerCase() !== "treniitalia" && provider.toLowerCase() !== "flixbus" && provider.toLowerCase() !== "itabus")
        {
            const error = "Error creation Solution --- costructor (provider error) - MezzoId";
            console.log("[DEBUG] " + error);
            return null;
        }
        else if (![id, destination, origin, ultimo_rilevamento, ora_ultimo_rilevamento, fermate, note, ritardo].every(x => x !== undefined))
        {
            const error = "Error creation Solution --- costructor (undefined essential component) - MezzoId";
            console.log("[DEBUG] " + error);
            return null;
        }
        else
        {
            this.id = id
            this.provider = provider
            this.origin = origin
            this.destination = destination
            this.ultimo_rilevamento = ultimo_rilevamento
            this.ora_ultimo_rilevamento = ora_ultimo_rilevamento
            this.fermate = fermate
            this.note=note
            this.ritardo=ritardo
        }

    }

    getId() 
    {
        return this.id;
    }
    
    getProvider() {
        return this.provider;
    }
    
    getOrigin() {
        return this.origin;
    }

    getDestination() {
        return this.destination;
    }

    getUltimoRilevamento() {
        return this.ultimo_rilevamento;
    }

    getOraUltimoRilevamento() {
        return this.ora_ultimo_rilevamento;
    }

    getOrarioPrevisto(stazione_fermata)
    {
        this.fermate.forEach(f => {
            if(f.stazione === stazione_fermata)
            {
                return f.arrivo_teorico
            }
        });
    }

    getNote()
    {
        return this.note
    }

    getRitardo()
    {
        return this.ritardo
    }

    toString() {
        const separator = "--------------------------------------------------------------------------------------";
        const id = `ID: ${this.getId()}`;
        const provider = `Provider: ${this.getProvider()}`;
        const origin = `Origin: ${this.getOrigin()}`;
        const destination = `Destination: ${this.getDestination()}`;
        const ultimo_rilevamento = `Ultimo rilevamento: ${this.getUltimoRilevamento()} - ${this.getOraUltimoRilevamento()}`;
        const note = `note: ${this.getNote()} `;
        const ritardo = `Ritardo: ${this.getRitardo()} `;

        return `${separator}\n${id}\n${provider}\n${origin}\n${destination}\n${ultimo_rilevamento}\n${note}\n${ritardo}\n${separator}`;
      }

}

//---------------------------------------------- Classe Soluzione ---------------------------------------------------------------

class Soluzione
{
    constructor(id,provider, origin, destination,price,durata,timestampDeparture,timestampArrival, status,note)
    {
        if(provider.toLowerCase() !== "treniitalia" && provider.toLowerCase() !== "flixbus" && provider.toLowerCase() !== "itabus")
        {
            const error = "Error creation Solution --- costructor (provider error) - Soluzione";
            console.log("[DEBUG] " + error);
            return null;
        }
        else if (![origin, destination, price, status, durata, timestampDeparture, timestampArrival].every(x => x !== undefined)) 
        {
            const error = "Error creation Solution --- costructor (undefined essential component) ";
            console.log("[DEBUG] " + error);
            return null;
        }
        else
        {
            this.id = id;
            this.provider = provider.toLowerCase();
            this.origin = origin;
            this.destination = destination;
            this.price = price;
            this.durata = durata
            this.status = status;
            this.note = note;
            if(this.provider === "treniitalia")
            {
                this.mezzo = "Treno"
            }
            else if(this.provider === "flixbus" || this.provider === "itabus" )
            {
                this.mezzo = "Autobus"
            }

            if(convertTimestampToDateTime(timestampArrival) == null || convertTimestampToDateTime(timestampDeparture) == null)
            {
                return null;
            }
            else
            {
                this.arrivalTime = convertTimestampToDateTime(timestampArrival).split("@")[1]
                this.departureTime = convertTimestampToDateTime(timestampDeparture).split("@")[1]
            }
            

        }

    }

    getId() {
        return this.id;
    }
    
    getProvider() {
        return this.provider;
    }

    getOrigin() {
        return this.origin;
    }

    getDestination() {
        return this.destination;
    }

    getPrice() {
        return this.price;
    }

    getDurata(){
        return this.durata
    }

    getStatus() {
        return this.status;
    }

    getArrivalTime() {
        return this.arrivalTime
    }

    getDeparturTime() {
        return this.departureTime
    }

    getNote() {
        return this.note;
    }

    getMezzo()
    {
        return this.mezzo;
    }

}

export {Soluzione, MezzoId, convertTimestampToDateTime}