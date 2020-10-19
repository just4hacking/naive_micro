const express = require('express')
const bodyParser = require('body-parser')
const axios  = require('axios')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

function handleEvent(event) {
  const { data, type } = event

  switch (type) {
    case 'PostCreated': {
      const { id, title } = data
      posts[id] = { id, title, comments: [] }
      break
    }
    case 'CommentCreated': {
      const { postId, content, id, status } = data
      const post = posts[postId]
      post.comments.push({ id, content, status })
      break
    }
    case 'CommentUpdated': {
      const { id, content, postId, status } = data
      const post = posts[postId]
      const comment = post.comments.find(comment => {
        return comment.id === id
      })
      comment.status = status
      comment.content = content
      break
    }
    default:
      break
  }
}

app.post('/events', (req, res) => {
  handleEven(req.body)
  res.send({})
})

app.get('/posts', (req, res) => {
  res.send(posts)
})

const port = 4002
app.listen(port, async () => {
  console.log(`listening on ${port}`)

  const res = await axios.get('http://localhost:4005/events')
  for (let event of res.data) {
    console.log(`Processing event ${event.type}`)
    handleEvent(event)
  }
})