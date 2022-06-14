import algoliasearch from 'algoliasearch';

const algolia = algoliasearch('CD279WEMBF', 'b388e0b552136717565c18ffd71199d5');

const index = algolia.initIndex('pharmacies');

export async function webhook(req, res) {
    if (req.method !== 'POST') return res.end();
    
    try {
        const { id_: objectID, ...data1 } = req.body.data;
            index.search(data1.id).then(async ({hits}) => {
                if (hits.length == 0) {
                    await index.saveObject(data1, {'autoGenerateObjectIDIfNotExist': true});
                }
            });
        res.sendStatus(201);
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }

}
