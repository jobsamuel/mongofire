import Firebase from 'firebase';
import MongoClient from 'mongodb';

const tk = process.env.FB_TOKEN || '<YOUR-FIREBASE-TOKEN>';
const fb = process.env.FB_APP || '<YOUR-FIREBASE-APP-NAME>';
const url = process.env.MONGODB_URL || '<MONGODB-URL>';
const ref = new Firebase(`https://${fb}.firebaseio.com/`);

function mongo(callback) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collections(function(err, collections) {
			if (err) {
				return callback(err);
			}

			console.log(`${collections.length} Collections were found.`);

			const collectionNames = collections.map((c) => c.s.name);

			collectionNames.forEach(function(name, count) {
				db.collection(name).find({}).toArray(function(err, docs) {
					if (err) {
						return callback(err);
					}
					
					if (name !== 'system.indexes') {
						callback(null, { name: name, docs });
					}
				});
			});
		});
	});
}

ref.authWithCustomToken(tk, function(err, authData) {
	if (err) {
		return console.log(err);
	}

	mongo(function(err, result) {
		if (err) {
			return console.log(err);
		}

		ref.child(result.name).set(result.docs, function(e) {
			if (e) {
				return console(e);
			}

			console.log(`Collection ${result.name} synchronized with Firebase!`);
		});
	});
});
