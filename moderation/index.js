const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.post('/events', async (req, res) => {
  const { type, data } = req.body

  switch (type) {
    case 'CommentCreated':
      const status = data.content.includes('orange')? 'rejected' : 'approved'
      await axios.post('http://localhost:4005/events', {
        type: 'CommentModerated',
        data: {
          id: data.id,
          postId: data.postId,
          status,
          content: data.content
        }
      })
      break
    default:
      break
  }

  res.send({})
})

const port = 4003
app.listen(port, () => {
  console.log(`listening on ${port}`)
})