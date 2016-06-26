	'use strict'
	const data = require('./fetcher')
	const port = 3000
	const path = require('path')
	const express = require('express')
	const request = require('request-promise')
	const app = express()
	const linkeOne = 'linkOne'
	const linkTwo = 'linkTwo'

	app.get('/api/linkTwo', onlinkTwoRequest)
	app.get('/api/linkeOne', onlinkeOneRequest)

	function onlinkTwoRequest (req, res) {
		getlinkTwoData().then(function (parsedBody) {
			res.json(parsedBody.hits.hits)
		}).catch(function (err) {
			console.log('Trying to reconnect...')
			res.sendStatus(err)
		})
	}

	function getlinkTwoData () {
		var options = {
			method: 'POST',
			uri: linkTwo,
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json'
			},
			body: {
				size: '20',
				sort: [ { '@timestamp': { order: 'desc', ignore_unmapped: true } } ]
			},
			json: true
		}
		return request(options)
	}

	function onlinkeOneRequest (req, res) {
		var options = {
			method: 'GET',
			uri: linkeOne,
			json: true
		}

		request(options)
			.then(function (parsedBody) {
				res.setHeader('content-type', 'application/json')
				res.json(parsedBody.Result)
			})
			.catch(function (err) {
				console.log('Trying to reconnect...')
				res.status(err)
				.send('Not found')
			})
	}

	var routers = []
	var routerNum = [2938, 2939, 2938, 2939]
	for (var t = 0; t < 4; t++) {
		routers.push('http://observium.xsnews.intern/data.php?id=' + routerNum[t])
	}
	var paramArr = ['one', 'two', 'three', 'four']
	for (var b = 0; b < 4; b++) {
		var routerFetch = new data.fetch(routers[b])
		app.get('/router' + paramArr[b] + '/:timestamp', function (req, res) {
			var timestamp = parseInt(req.params.timestamp)
			res.send(routerFetch.getSlicedObj(timestamp))
		})
	}
