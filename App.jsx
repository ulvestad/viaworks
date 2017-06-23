import React from 'react';
import Dyr from './Components/Dyr.js';
import TabellKolonner from './Components/TabellKolonner.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bilder: [
				"http://www.zoologen.no/images/Katttre.jpg",
				"https://www.zoopermarked.no/resources/category/1_h/und/1%20hund.jpg?width=400&height=230&format=jpg"
			],
			informasjon: [
				{
					dok_id: 1111,
					dok_navn: "NAVN1",
					datoer: ["01.01.2001","02.02.2002","03.03.2003"],
					kommuner: ["Trondheimen", "TrondheimTo"],
					stedsnavn: ["Lade","Sentrum","Lade Gård"],
					mineraler: ["Bare", "gull", "og", "grønne", "skoger", "der", "jeg", "kommer", "fra", "for", "å", "si","det", "sånn"]
				},
				{
					dok_id: 2222,
					dok_navn: "NAVN2",
					datoer: ["04.04.2004","05.05.2005","06.06.2006"],
					kommuner: ["Verdensrommet", "Månen", "NRO"],
					stedsnavn: ["NASA","Romvesen","Terminator", "E.T."],
					mineraler: ["Romskip", "Ost", "Flagg", "Hemmelig base", "Forsvarssystem"]
				},
				{
					dok_id: 3333,
					dok_navn: "NAVN3",
					datoer: ["07.07.2007","08.08.2008","09.09.2009"],
					kommuner: ["Aurskog-Høland"],
					stedsnavn: ["Elgheia","Urskæv","Tævsjøen"],
					mineraler: ["Nek", "Urfolk","24 hemmelige baser"]
				}
			]
		}
	}

    render() {

      return (
      	<div>
	  		<div id="bilder">
	  			{this.state.bilder.map((bilder) => 
			        <Dyr key={bilder} bilde={bilder} />
			    )}
	  		</div>
	     	<tabel>
	         	<th>DokumentID</th>
	     		<th>Dokumentnavn</th>
	     		<th>Datoer</th>
	     		<th>Kommuner</th>
	     		<th>Stedsnavn</th>
	     		<th>Mineraler</th>

	         	{this.state.informasjon.map((info) => 
			        <TabellKolonner key={info.dok_id} dok_id={info.dok_id} dok_navn={info.dok_navn} datoer={info.datoer} 
			        kommuner={info.kommuner} stedsnavn={info.stedsnavn} mineraler={info.mineraler}/>
			    )}

         	</tabel>
        </div>
      );
   }
}

export default App;
