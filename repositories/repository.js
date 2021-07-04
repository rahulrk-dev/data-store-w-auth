const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

module.exports = class Repository {
	constructor(filename) {
		if (!filename) {
			throw new Error('Creating a repository requires a filename')
		}

		this.filename = filename
		try {
			fs.accessSync(this.filename)
		} catch (err) {
			fs.mkdirSync(path.dirname(this.filename), { recursive: true })
			fs.writeFileSync(this.filename, '[]')
		}
	}

	async getAll() {
		return JSON.parse(
			await fs.promises.readFile(this.filename, {
				encoding: 'utf8',
			})
		)
	}

	async getOne(id) {
		const records = await this.getAll()
		return records.find((record) => record.id === id)
	}

	async getOneBy(filters) {
		const records = await this.getAll()

		for (let record of records) {
			let isFound = true

			for (let key in filters) {
				if (record[key] !== filters[key]) {
					isFound = false
				}
			}

			if (isFound) {
				return record
			}
		}
	}

	async create(attrs) {
		// attrs === { email: '', password: '' }
		attrs.id = this.randomId()
		attrs.createdAt = new Date()
		attrs.updatedAt = new Date()

		const records = await this.getAll()
		records.push(record)

		await this.writeAll(records)

		return attrs
	}

	async update(id, attrs) {
		attrs.updatedAt = new Date()
		const records = await this.getAll()
		const record = records.find((record) => record.id === id)

		if (!record) {
			throw new Error(`Record with id ${id} not found`)
		}

		Object.assign(record, attrs)

		await this.writeAll(records)
	}

	async delete(id) {
		const records = await this.getAll()
		const filteredRecords = records.filter((record) => record.id !== id)

		await this.writeAll(filteredRecords)
	}

	async writeAll(records) {
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2))
	}

	randomId() {
		return crypto.randomBytes(8).toString('hex')
	}
}
