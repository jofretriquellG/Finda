import algoliasearch from 'algoliasearch';

const algolia = algoliasearch('CD279WEMBF', 'b388e0b552136717565c18ffd71199d5');

const index = algolia.initIndex('pharmacies');

export async function webhook(req, res) {
    if (req.method !== 'POST') return res.end();
    
    try {
        const { id_: objectID, ...data1 } = req.body.data;
        console.log(data1);
        await index.saveObject(data1, { 'autoGenerateObjectIDIfNotExist': true });
        console.log(data1);
        res.send(201);
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }

};
