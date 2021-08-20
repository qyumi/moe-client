# Discord Logging Client

### Project structure

- **client/** - Contains the bots core client
- **events/** - Events that will be catched and processed in here
- **interfaces/** - Interfaces or types that are required for the events
- **models/** - Database models
- **index.ts** - Starting point

### Requirements

- Node.js 14.16 or higher **required**
- MongoDB **required**
- S3 server like AWS or MinIO **required**
- Yarn (optional)
- PM2 (optional)

### Running the client

To run the start, you first need to create a .env file located in the clients working directory.

1. Create a .env file. An example is located in the root of the repository.

2. Install dependencies using:
   `yarn` or `npm install`

3. Build the project using:
   `yarn build` or `npm build`

4. Run
   `node lib/index.js`
