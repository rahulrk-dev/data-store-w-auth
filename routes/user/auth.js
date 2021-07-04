const express = require('express')
const { validationResult } = require('express-validator')
const usersRepo = require('../../repositories/users')
const signUpTemplate = require('../../views/user/auth/signup')
const signInTemplate = require('../../views/user/auth/signin')
const {
	requireEmail,
	requirePassword,
	requireConfirmPassword,
	requireEmailExists,
	requireValidPasswordForUser,
} = require('./validators')
const layout = require('../../views/layout')

const router = express.Router()

router.get('/signup', (req, res) => {
	res.send(signUpTemplate({ req }))
})

router.post(
	'/signup',
	[requireEmail, requirePassword, requireConfirmPassword],
	async (req, res) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.send(signUpTemplate({ req, errors }))
		}

		const { email, password } = req.body

		const user = await usersRepo.create({ email, password })

		req.session.userId = user.id

		res.send(layout({ content: 'Account created!' }))
	}
)

router.get('/signin', (req, res) => {
	res.send(signInTemplate())
})

router.post(
	'/signin',
	[requireEmailExists, requireValidPasswordForUser],
	async (req, res) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return res.send(signInTemplate({ errors }))
		}

		const { email } = req.body

		const user = await usersRepo.getOneBy({ email })

		req.session.userId = user.id

		res.send(layout({ content: 'You are signed in!' }))
	}
)

router.get('/logout', (req, res) => {
	req.session = null
	res.send(layout({ content: 'You are logged out' }))
})

module.exports = router
