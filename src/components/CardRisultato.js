import React from "react";
import trenitaliaLogo from "../assets/trenitalia.png";
import flixbusLogo from "../assets/flixbus.svg";
import itabusLogo from "../assets/itabus.png";

const CardRisultato = (props) => {
    const { provider, origin, destination, durata, price, mezzo, departureTime, arrivalTime } = props.risultato;

    let logoSrc = "";
    let ticketClass = "";
    let id = ""

    let partenzaView = origin.replace("( Tutte Le Stazioni )", "").replace("Centrale", "")
    let destinazioneView = destination.replace("( Tutte Le Stazioni )", "").replace("Centrale", "")

    if (provider === "treniitalia") {
        id = "1"
        logoSrc = trenitaliaLogo;
        ticketClass = "ticket fs-1 trenitalia";
    } else if (provider === "flixbus")
    {
        id="2"
        logoSrc = flixbusLogo;
        ticketClass = "ticket flixbus";
    }
    else if (provider === "itabus")
    {
        id="2"
        logoSrc = itabusLogo;
        ticketClass = "ticket itabus";
    }

    return (

        <div id={id} className={ticketClass}>
            <img
                src={logoSrc}
                alt=""
                className="logo-mezzo"
            />
            <h2 className="fs-1">Partenza:</h2>
            <div className="orario-p">{departureTime}</div>
            <div className="luogo-p">{partenzaView}</div>
            <h2 className="fs-1">Arrivo:</h2>
            <div className="orario-a">{arrivalTime}</div>
            <div className="luogo-a">{destinazioneView}</div>
            <h2 className="fs-1">Durata:</h2>
            <div className="durata">{durata.hours + "h " + durata.minutes + "m"}</div>
            <div className="prezzo fs-3">{price}€</div>
            <div className="id-mezzo"></div>
        </div>


    );
};

export default CardRisultato;
