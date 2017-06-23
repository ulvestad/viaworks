var config = {   
   
   entry: './main.js',

   node:{
      dns:"empty",
      tls:"empty",
      net:"empty",
      fs:"empty"
   },
	 

   output: {
      path:'/',
      filename: 'index.js',
   },
	
   devServer: {
      inline: true,
      port: 8080
   },

   module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
				
            query: {
               presets: ['es2015', 'react']
            }
         }
      ]
   }
}

module.exports = config;