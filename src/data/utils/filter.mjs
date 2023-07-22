/*
    Filter.js = implementa algoritmi che filtrano le soluzioni proposte in base a 
        - PREZZO
        - MEZZO
        - DURATA
        - BEST SOLUTION

*/

//Mezzi possibili nelle soluzioni
const Filter_mezzo = {
    TRAIN_ONLY : 'Treno',
    BUS_ONLY : 'Autobus',

}

//Parametri di ordinamento possibili nelle soluzioni
const Filter_descr = {
    PREZZO : 'prezzo',
    DURATA : 'durata',
    BEST_SOLUTION : 'Best'
    
}

//Conversione durata --> millisecondi per riuscire ad ordinare
function durataToMillisecondi(durationJSON)
{
  var hours = durationJSON.hours
  var minutes = null

  try
  {
    minutes = durationJSON.minutes
  }
  catch
  {
    ;
  }
  const totalMinutes = hours * 60 + minutes;
  const totalMilliseconds = totalMinutes * 60 * 1000;
  return totalMilliseconds;
}


//Funzione che ritorna LA MIGLIORE SOLUZIONE -- ossia quella con minor prezzo e minor durata
function findBestSolution(solutions) 
{
    if(solutions.length === 0 || solutions === null || solutions === undefined)
    {
        console.log("[DEBUG] errore inserimento parametro solutios -- check findBestSolution() - filter.mjs")
        return null;
    }

    // Ordiniamo l'array in base al prezzo crescente e alla durata crescente
    const sortedSolutions = solutions.sort((a, b) => {
      if (a.price === b.price) {
        return durataToMillisecondi(a.durata) - durataToMillisecondi(b.durata);
      }
      return a.price - b.price;
    });
  
    // Selezioniamo la prima soluzione con prezzo minore uguale al primo prezzo dell'array ordinato
    let bestSolution = null;
    let minPrice = sortedSolutions[0].price;
    for (let i = 0; i < sortedSolutions.length; i++) {
      const solution = sortedSolutions[i];
      if (solution.price > minPrice) {
        break;
      }
      if (bestSolution === null || durataToMillisecondi(solution.durata) < durataToMillisecondi(bestSolution.durata)) {
        bestSolution = solution;
      }
    }
    let soluzioniOrdinate = []
    soluzioniOrdinate.push(bestSolution)

    return soluzioniOrdinate;
}

//Funzione che ritorna array di soluzioni ORDINATE in base ai criteri scelti
function ordinaSoluzioni(soluzioni, filter_mezzo, filter_descr, num) {
    
    // Verifico se filter_descr è valido
    if (Object.values(Filter_descr).indexOf(filter_descr) < 0) 
    {
        console.log("[DEBUG] Errore inserimento parametro 'filter_descr' -- check ordinaSoluzioni() - filter.mjs ")
        return null;
    }
    
    if(filter_descr === Filter_descr.BEST_SOLUTION)
    {
      return findBestSolution(soluzioni)
    }
    
    var soluzioniOrdinate = []
    
    // Filtro le soluzioni in base al mezzo se filter_mezzo non è nullo
    if (filter_mezzo != null) {
        
        if (Object.values(Filter_mezzo).indexOf(filter_mezzo) < 0) {
          console.log("[DEBUG] Errore inserimento parametro 'filter_mezzo' -- check ordinaSoluzioni() - filter.mjs ")
          return null;
        }
        
        for(var i = 0; i< soluzioni.length;i++)
        {
          if(soluzioni[i].mezzo.toLowerCase() === filter_mezzo.toLowerCase())
          {
            soluzioniOrdinate.push(soluzioni[i])
          }
        }
      
    }
    else
    {
      // Creo una copia dell'array soluzioni
      soluzioniOrdinate = [...soluzioni];
    }
  
    // Ordino le soluzioni in base al criterio specificato
    switch (filter_descr) {
      case Filter_descr.PREZZO:
        soluzioniOrdinate.sort((a, b) => a.price - b.price);
        break;
      case Filter_descr.DURATA:
        soluzioniOrdinate.sort((a, b) => durataToMillisecondi(a.durata) - durataToMillisecondi(b.durata));
        break;
      default:
        console.log("[DEBUG] Errore inserimento parametro 'filter_descr' non valido -- check ordinaSoluzioni() - filter.mjs ")
        return null;
    }
    
    if(num != null)
    {
      if(num < soluzioniOrdinate.length)
      {
        soluzioniOrdinate.splice(num)
      }
    }
    
    return soluzioniOrdinate;
}

export {Filter_mezzo,Filter_descr, findBestSolution, ordinaSoluzioni}
