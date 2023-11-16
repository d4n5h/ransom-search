const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const csvtojson = require('csvtojson');
const Item = require('./models/item.model');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function downloadCSVAndConvertToJSON(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url, { responseType: 'stream' });
            const csvStream = response.data;
            const jsonStream = csvtojson().fromStream(csvStream);

            const jsonArray = [];
            jsonStream
                .on('data', (jsonObj) => {
                    jsonArray.push(JSON.parse(jsonObj));
                })
                .on('done', (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(jsonArray);
                    }
                });
        } catch (error) {
            reject(error);
        }

    });
}

async function updateDatabase() {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await downloadCSVAndConvertToJSON('https://www.ransomware.live/posts.csv');

            const itemsCount = await Item.query().resultSize();

            let itemsToInsert = data.map(item => {
                return {
                    target: item.post_title,
                    group: item.group_name,
                    description: item.description,
                    website: item.website,
                    post_url: item.post_url,
                    discovered: new Date(item.discovered),
                    published: new Date(item.published),
                };
            })

            // Only get the items that are not already in the database
            itemsToInsert = itemsToInsert.slice(itemsCount);

            await Item.query().insertGraph(itemsToInsert);

            resolve(itemsToInsert.length);
        } catch (error) {
            reject(error);
        }
    });
}

// Run every day at 00:00
cron.schedule('0 0 * * *', async () => {
    console.log('Updating database...');
    const count = await updateDatabase();
    console.log(`Inserted ${count} items into the database`);
});

app.get('/', async (req, res) => {
    try {
        const query = Item.query();
        const q = req?.query?.q;
        if (q){
            query.where('target', 'like', `%${q}%`);
            query.orWhere('group', 'like', `%${q}%`);
        }

        query.orderBy('published', 'desc');

        const items = await query;
        if (items?.length > 0) {
            res.json(items);
        } else {
            res.status(404).json({ message: 'No items found' });
        }
    } catch (error) {
        
    }

});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});