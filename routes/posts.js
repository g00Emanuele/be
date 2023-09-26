const express = require('express')
const posts = express.Router()

posts.get('/posts', (req, res) => {
    res.send({
        author:'Emanuele',
        job: 'student'
    })
})



module.exports = posts