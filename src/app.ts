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

const url="https://api-eu-central-1.graphcms.com/v2/cl2u6114m0wbs01yzgitt7dxc/master";

app.post("/graphcms",async (req: Request, res: Response) => {
	
	const graphQLClient = new GraphQLClient(url,{
		headers:{
			"Authorization" : "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NTMzODEyODMsImF1ZCI6WyJodHRwczovL2FwaS1ldS1jZW50cmFsLTEuZ3JhcGhjbXMuY29tL3YyL2NsMnU2MTE0bTB3YnMwMXl6Z2l0dDdkeGMvbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMDg1NjRhMjItZTJkZS00N2QzLTkzODgtOTkzMzM3NDBmNTlhIiwianRpIjoiY2wzandpejAxOHk0MTAxeG4xN3o3ZjZscyJ9.FJ3flJY4G3zGDB7oXtqIXkz7xuCHZ0l9Rr3WYVCnu1decaQbSafOEwXxIHCRh2MN95L5rhn-zKd-bplNtb5hFIGjy60BqjCWTZppvebYGO6oZc0rqwDrAF4BV-yTObBeCOQ_QA_Z4I56mld-0-5aYcxRKW5t8SxFq4qq3WV0bTDqk4OBA55nZ7STHahvs0AMJFn-i8SZ_AX6TcKlYmy43rtcqVPw5jAAPRW7S9G82XqMnP8vBXua2a_9iQkaMJfDjK9iVytauQlD_jqWNBTGLORDmLahGuu_ikgfTVHdZiJaQbpV4tRZ5lgLq8D0yXXEXR0SgBAy_E_t_c3MJpNYOfLvem5S2wimIeahmKOjqlKXoH3ejYZbQ26rChmdrdONSEHM9Y3rVg87YDCM685jdIId5GLxfQ_mooVbsLOg1l4jFMckMcZOMKDQBocJNGCIGnZnEqSqNNMzXilZ6lmMYgiEtZCerTZmOpMDJKZdxGVa5_JwrLeUfsfwwncsr5k_DtuAThd1pDf6lNqHDEAHtm1JrgnhA-HtG5u6R2xUi40gbfU5lklyzazA2xVD31ruW_NFNgxQM-9NvXdK4LzU0hDQylKLaEb3NI-kJ3uWUp2NadQjTPF2LG7OSJV1BAhQQwXsqFatwTqK4SaIA-qXF2YG8yrn5B9YN90jtBVEI9U"
		}
	})

	const query=gql`
	query {
		pharmacies {
		  geometry {
			coordinates
			type
		  }
		  properties {
			city
      		address
			name
			postalCode
			tel
		  }
		}
	  }
	`;
	const data =await graphQLClient.request(query);
	res.status(200).send({pharmacies : data.pharmacies});
})

app.get("/uploadcontent",async (req: Request, res: Response) => {
	
	const createContentEntry = async () => {
		const graphQLClient = new GraphQLClient(url,{
			headers:{
				"Authorization" : "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NTMzODEyODMsImF1ZCI6WyJodHRwczovL2FwaS1ldS1jZW50cmFsLTEuZ3JhcGhjbXMuY29tL3YyL2NsMnU2MTE0bTB3YnMwMXl6Z2l0dDdkeGMvbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMDg1NjRhMjItZTJkZS00N2QzLTkzODgtOTkzMzM3NDBmNTlhIiwianRpIjoiY2wzandpejAxOHk0MTAxeG4xN3o3ZjZscyJ9.FJ3flJY4G3zGDB7oXtqIXkz7xuCHZ0l9Rr3WYVCnu1decaQbSafOEwXxIHCRh2MN95L5rhn-zKd-bplNtb5hFIGjy60BqjCWTZppvebYGO6oZc0rqwDrAF4BV-yTObBeCOQ_QA_Z4I56mld-0-5aYcxRKW5t8SxFq4qq3WV0bTDqk4OBA55nZ7STHahvs0AMJFn-i8SZ_AX6TcKlYmy43rtcqVPw5jAAPRW7S9G82XqMnP8vBXua2a_9iQkaMJfDjK9iVytauQlD_jqWNBTGLORDmLahGuu_ikgfTVHdZiJaQbpV4tRZ5lgLq8D0yXXEXR0SgBAy_E_t_c3MJpNYOfLvem5S2wimIeahmKOjqlKXoH3ejYZbQ26rChmdrdONSEHM9Y3rVg87YDCM685jdIId5GLxfQ_mooVbsLOg1l4jFMckMcZOMKDQBocJNGCIGnZnEqSqNNMzXilZ6lmMYgiEtZCerTZmOpMDJKZdxGVa5_JwrLeUfsfwwncsr5k_DtuAThd1pDf6lNqHDEAHtm1JrgnhA-HtG5u6R2xUi40gbfU5lklyzazA2xVD31ruW_NFNgxQM-9NvXdK4LzU0hDQylKLaEb3NI-kJ3uWUp2NadQjTPF2LG7OSJV1BAhQQwXsqFatwTqK4SaIA-qXF2YG8yrn5B9YN90jtBVEI9U"
			}
		})

		json.forEach(element => {

			const id = element.id;
			const type = element.type;
			const geometryType = element.geometry.type;
			const coordinates = element.geometry.coordinates;
			const name = element.properties.name;
			const postalCode = element.properties.postalCode;
			const tel = element.properties.tel;
			const city = element.properties.city;
			const address = element.properties.address;

			const query=gql`mutation {
				createPharmacy(
				data: {id_:${id}, type: "${type}", properties: {create: {name: "${name}", address: "${address}", city: "${city}", postalCode: "${postalCode}", tel: "${tel}"}}, geometry: {create: {type: "${geometryType}", coordinates: [${coordinates}]}}}
				){
					id
				  }
			}`;		

			const existsDraft =gql`query {
								pharmacies(
									where: { id_:${id} },
									stage: DRAFT
									) {
								id_
								}
							}`;

			const existsPublished =gql`query {
								pharmacies(
									where: { id_:${id} },
									stage: PUBLISHED
									) {
								id_
								}
							}`;

			//const resultDraft = graphQLClient.request(existsDraft);
			//const resultPublished = graphQLClient.request(existsPublished);

			graphQLClient.request(query);
		});
	}
	try {
		await createContentEntry();
		res.sendStatus(201);
	} catch (error) {
		res.sendStatus(error);
	}	
})

const port = 8080;

// start the Express server
app.listen( port, () => {
	console.log( `server started at http://localhost:${ port }` );
});