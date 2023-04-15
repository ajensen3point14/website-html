const { MongoClient } = require('mongodb');

async function main() {
	const uri = "mongodb+srv://ajensen3point14:V235yxe9!!YoDead@webprogramming.xzxdrcm.mongodb.net/?retryWrites=true&w=majority";
	
	const client = new MongoClient(uri);

	try {
	  await client.connect();
	} catch (e) {
	  console.error(e);
	} finally {
	  await client.close();
	}
}

main().catch(console.error);
