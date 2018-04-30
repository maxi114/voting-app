const express = require('express');
const router = express.Router({ caseSensitive: true });
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const Polls = require('../models/polls');

//create new poll

router.post('/polls', authenticate, function(request, response) {

})



//register
router.post('/register', function(request, response) {
    if (request.body.name && request.body.password) {
        var user = new User();
        user.name = request.body.name;
        console.time('bcryptHashing');
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        console.timeEnd('bcrptHashing');
        user.save(function(err, document) {
            if (err) {
                return response.status(400).send(err)
            } else {
                var token = jwt.sign({
                    data: document
                }, process.env.secret, { expiresIn: 3600 })
                return response.status(201).send(token);
            }
        })

    } else {
        return response.status(400).send({
            message: 'invalid credentials supplied'
        })
    }
});

//verification of token
router.post('/verify', function(request, response) {
    if (!request.body.token) {
        return response.status(400).send('no token has being provided!')
    }
    jwt.verify(request.body.token, process.env.secret, function(err, decoded) {
        if (err) {
            return response.status(400).send('Error with token')
        }
        return response.status(200).send(decoded)
    })
})

//login
router.post('/login', function(request, response) {
    if (request.body.name && request.body.password) {
        User.findOne({ name: request.body.name }, function(err, user) {
            if (err) {
                console.log('err with db')
                return response.status(400).send('An error has occured. Please try again')
            }
            if (!user) {
                console.log('no user')
                return response.status(404).send('Invalid information');
            }
            if (bcrypt.compareSync(request.body.password, user.password)) {
                console.log('pws match')
                var token = jwt.sign({
                    data: user
                }, process.env.secret, { expiresIn: 3600 })
                return response.status(200).send(token);
            }
            console.log('invalid pw')
            return response.status(400).send('password is not correct');
        })
    } else {
        return reponse.status(400).send('Please enter valid credentials')
    }
})

//authentication middleware
function authenticate(request, response, next) {
    console.log(request.headers);
    if (!request.headers.authorization) {
        return response.status(400).send('No token supplied')
    }
    if (request.headers.authorization.split(' ')[1]) {
        var token = request.headers.authorization.split('')[1]
        jwt.verify(token, process.env.secret, function(err, decoded) {
            if (err) {
                return response.status(400).send(err)
            }
            console.log('continuing with middleware shain!')
            next()
        })
    }
};

module.exports = router;