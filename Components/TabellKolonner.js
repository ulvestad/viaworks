import React from 'react';

class TabellKolonner <dok_id, dok_navn, datoer, kommuner, stedsnavn, mineraler > extends React.Component {
   // linjeformatering() under er en alternativ fremvisningsmåte av informasjon.
   linjeformatering(innData) {
      var utData = "";
      for(var i=0;i<innData.length; ++i) {
         if(i==0){
            utData = innData[i];
         } else {
            utData = utData + ", " + innData[i] + "\n";
         }
      }
      return (
         <div>{utData}</div>
      );
   }

   listeformatering(innData) {
      const utData = innData.map((dat) => 
         <dt key={dat}>{dat}</dt>
      )
      return (
         <dl>{utData}</dl>
      )
   }

   render() {
      return (
   		<tr id="tr-style">
   			<td>{this.props.dok_id}</td>
   			<td>{this.props.dok_navn}</td>
            <td>{this.listeformatering(this.props.datoer)}</td>
            <td>{this.listeformatering(this.props.kommuner)}</td>
   			<td>{this.listeformatering(this.props.stedsnavn)}</td>
   			<td>{this.linjeformatering(this.props.mineraler)}</td>
   		</tr>
      );
   }
}

export default TabellKolonner;