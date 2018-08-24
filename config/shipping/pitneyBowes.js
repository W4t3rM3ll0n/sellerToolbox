'use strict'
require('dotenv').config();

const httpReq = require('../httpReq');
const Users = require('../../models/users')

module.exports = {

	getOAuthToken: async (userId) => {

		// Encode key and secret
		const encoded = Buffer.from(`${process.env.PB_KEY}:${process.env.PB_SECRET}`).toString('base64');

		// Set options
		const options = httpReq.httpOptions('api-sandbox.pitneybowes.com', 443, '/oauth/token', 'POST', {
				'Authorization': `Basic ${encoded}`,
				'Content-Type': 'application/x-www-form-urlencoded'
		});

		// Request Body Post Data
		const postData = httpReq.postData({
			'grant_type': 'client_credentials'
		});

		const result = await httpReq.retrieve(options, postData);

		let user = await Users.findOne({ _id: userId }).exec();
		user.tokens.pitneyBowesAuthToken = result.access_token;

		await Users.update({ _id: userId }, user).exec();

		return 'Access Token saved'

	}

}
