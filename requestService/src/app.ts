import * as dotenv from 'dotenv';
dotenv.config()
import * as express from 'express'
import * as cors from "cors"
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import { getAFile } from './config/supabaseS3';

// setting up express server
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({
  limit: '50mb'
}))

app.disable('etag')

//// setting up cors. Only allowed origin can make api request
const allowedOrigins: string[] = ['https://example.com'];
const corsOptions = {
  credentials: true,
  origin: allowedOrigins,
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization, Cookie'
};

app.use(cors(corsOptions));

app.get('/run-server', (req, res) => {
  return res.status(200).json({ message: "Server running don't worry" })
})

app.get("/*", async (req, res) => {

  const host = req.hostname;

  console.log(host)

  const project_id = host.split(".")[0];
  const fileName = req.path;

  const contents = await getAFile(fileName, project_id)

  const buffer = await contents?.arrayBuffer() ; // Convert Blob to ArrayBuffer
  const content = Buffer?.from(buffer); 
  
  const type = fileName.endsWith("html") ? "text/html" : fileName.endsWith("css") ? "text/css" : "application/javascript"
  res.set("Content-Type", type);

  res.send(content);
})

const port = process.env.PORT || 8000;
app.listen(port, () => console.log("server is running"));
