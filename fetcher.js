const request = require('request-promise')


function BandwidthFetcher (url) {

	this.timestampArr = []
	this.differenceOutArr = []
	this.differenceInArr = []
	var previousTimestamp, timestamp, currentIn, currentOut
	var previousOut, previousIn
	setInterval(function () {

		request(url, function (error, response, body) {
			if (error) {
				return
			}
			var data = body.split('|').map(function (item) {
				return parseInt(item)
			})

			timestamp = data[0]
			currentIn = data[1]
			currentOut = data[2]

			if (previousTimestamp && previousTimestamp !== timestamp) {
				var differenceOut = currentOut - previousOut
				var differenceIn = currentIn - previousIn
				this.timestampArr.push(timestamp)
				this.differenceInArr.push(differenceIn)
				this.differenceOutArr.push(differenceOut)
			}
			if (this.timestampArr.length === 500) {
				this.timestampArr.shift()
				this.differenceInArr.shift()
				this.differenceOutArr.shift()
			}
			previousTimestamp = timestamp
			previousIn = currentIn
			previousOut = currentOut
		}.bind(this))
	}.bind(this), 300)
}

BandwidthFetcher.prototype.getSlicedObj = function getSlicedObj (timestamp) {
	var index = this.timestampArr.indexOf(timestamp)
	var timeArrLength = this.timestampArr.length
	if (index === -1) {
		index = 0
	}
	if (index !== 0) {
		return {
			time: this.timestampArr.slice(index, timeArrLength),
			in: this.differenceInArr.slice(index, timeArrLength),
			out: this.differenceOutArr.slice(index, timeArrLength)
		}
	} else {
		return {
			time: this.timestampArr.slice(0, 100),
			in: this.differenceInArr.slice(0, 100),
			out: this.differenceOutArr.slice(0, 100)
		}
	}
}

module.exports.fetch = BandwidthFetcher
