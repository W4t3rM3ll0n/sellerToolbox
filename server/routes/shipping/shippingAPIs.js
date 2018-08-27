'use strict'
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const pitney = require('../../config/shipping/pitneyBowes');

router.get('/', (req, res) => {
  res.send('Hello from shipping');
});

router.get('/pitneyBowes', passport.authenticate('jwt', { session: false }), async (req, res) => {
	const id = req.user._id;

	await pitney.getOAuthToken(id).then((response) => {
		res.json({ response });
	}).catch(error => res.json({ error }));
});

module.exports = router;
