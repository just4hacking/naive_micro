const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

app.post('/events', (req, res) => {
  const { type, data } = req.body

  switch (type) {
    case 'PostCreated': {
      const { id, title } = data
      posts[id] = { id, title, comments: [] }
      break
    }
    case 'CommentCreated':
      const { postId, content, id } = data
      const post = posts[postId]
      post.comments.push({ id, content })
      break
    default:
      break
  }

  res.send({})
})

app.get('/posts', (req, res) => {
  res.send(posts)
})

const port = 4002
app.listen(port, () => {
  console.log(`listening on ${port}`)
})