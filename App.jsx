import React from 'react';
import Dyr from './Components/Dyr.js';
import TabellKolonner from './Components/TabellKolonner.js'

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bilde1: "http://www.zoologen.no/images/Katttre.jpg",
			bilde2: "https://www.zoopermarked.no/resources/category/1_h/und/1%20hund.jpg?width=400&height=230&format=jpg",
			dok_id: 1111,
			dok_navn: "NAVN1",
			datoer: ["01.01.2001","02.02.2002","03.03.2003"],
			kommuner: ["Trondheimen", "TrondheimTo"],
			stedsnavn: ["Lade","Sentrum","Lade Gård"],
			mineraler: ["Bare", "gull", "og", "grønne", "skoger", "der", "jeg", "kommer", "fra", "for", "å", "si","det", "sånn"]
		}
	}
   render() {
 	// const bilde1 = "http://www.agria.no/imagevault/publishedmedia/9yazji5f3qwy3innewo0/tva-katter-myser.jpg";
	// const bilde2 = "https://www.zoopermarked.no/resources/category/1_h/und/1%20hund.jpg?width=400&height=230&format=jpg";
      return (
      	<div>
         <Dyr bilde={this.state.bilde1}/>
      	 <Dyr bilde={this.state.bilde2}/>
         <tabel>
         	<th>DokumentID</th>
     		<th>Dokumentnavn</th>
     		<th>Datoer</th>
     		<th>Kommuner</th>
     		<th>Stedsnavn</th>
     		<th>Mineraler</th>
         	<TabellKolonner dok_id={this.state.dok_id} dok_navn={this.state.dok_navn} datoer={this.state.datoer} 
         		kommuner={this.state.kommuner} stedsnavn={this.state.stedsnavn} mineraler={this.state.mineraler} />
         	<TabellKolonner dok_id="2222" dok_navn="NAVN2" datoer={["20.02.2002"]} 
    			kommuner={["Trondheim"]} stedsnavn={["Lade"]} mineraler={["Bare gull og grønne skoger"]} />
         </tabel>
        </div>
      );
   }
}

export default App;
