import express, { Request, Response} from 'express';
import expressLayouts from 'express-ejs-layouts';
import {gql,GraphQLClient} from 'graphql-request';
import path from "path";
import {webhook} from './controllers/webhook';
import bodyParser from "body-parser";
import json from './public/assets/json/mataro.json';
const app = express();

// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Body parser init

app.use(bodyParser.json());

// Setting the root path for views directory
app.set('views', path.join(__dirname, 'views'));

const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));

app.get("/", (req: Request, res: Response) => {
	res.render("pharmacies")
})

//algolia
app.post("/webhook", (req: Request, res: Response) => {
	webhook(req,res);
})

const port = 8080;

// start the Express server
app.listen( port, () => {
	console.log( `server started at http://localhost:${ port }` );
});