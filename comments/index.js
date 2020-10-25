const express = require('express')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const axios = require('axios')
const cors = require('cors')
const { stat } = require('fs')

const app = express()

const commentsByPostId = {}

app.use(bodyParser.json())
app.use(cors())

app.get('/posts/:id/comments', function(req, res) {
  res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const id = randomBytes(4).toString('hex')
  const { content } = req.body

  const comments = commentsByPostId[req.params.id] || []
  
  comments.push({
    id,
    content,
    status: 'pending'
  })

  commentsByPostId[req.params.id] = comments

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  })

  res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
  console.log(`Emitted Event: ${req.body.type}`)
  const { type, data } = req.body

  switch (type) {
    case 'CommentModerated':
      const { postId, id, status, content } = data
      const comments = commentsByPostId[postId]

      const comment = comments.find(comment => {
        return comment.id === id
      })

      comment.status = status
      await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
          id,
          status,
          postId,
          content
        }
      })
      break
    default:
      break
  }

  res.send({})
})

const port = 4001

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})