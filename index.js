const express = require('express')
const app = express()
const cookieSession = require('cookie-session')
const authRouter = require('./routes/user/auth')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

app.use(
	cookieSession({
		keys: ['30baa43d7460e3d168a02c95'],
	})
)

// routes
app.use(authRouter)

app.all('*', (req, res, next) => {
	res.status(301).redirect('/signup')
	next()
})

app.listen(8080, () => {
	console.log('🚀 Server running on port 8080!')
})
