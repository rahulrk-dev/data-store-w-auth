const crypto = require('crypto')
const util = require('util')
const Repository = require('./repository')

const scrypt = util.promisify(crypto.scrypt)

class UsersRepository extends Repository {
	async create(attrs) {
		// attrs === { email: '', password: '' }
		attrs.id = this.randomId()
		attrs.createdAt = new Date()
		attrs.updatedAt = new Date()

		const salt = crypto.randomBytes(16).toString('hex')
		const buf = await scrypt(attrs.password, salt, 64)

		const records = await this.getAll()
		const record = {
			...attrs,
			password: `${buf.toString('hex')}.${salt}`,
		}
		records.push(record)

		await this.writeAll(records)

		return record
	}

	async comparePasswords(savedPass, suppliedPass) {
		// Saved -> password saved in our database. 'hashed.salt'
		// Supplied -> password given to us by user trying to sign in
		const [hashed, salt] = savedPass.split('.')
		const hashSuppliedBuf = await scrypt(suppliedPass, salt, 64)

		return hashed === hashSuppliedBuf.toString('hex')
	}
}

module.exports = new UsersRepository('data/users.json')
