# stock-api
Get the list of companies listed in NSE and get the stock details of each company

##Setup Database

Import the CSV containing the list of companies along with stock exchange Symbol to the query the stock details.

Create a collection named stocks in the database named api and use the command provide beloe to import the stock details.

mongoimport --type csv -d api -c stocks --headerline --drop stocks.csv
