require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')

//paths
const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI
const SET_WEBHOOK_PATH = `${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`

//config
const app = express()
app.use(bodyParser.json())

/**
 * Initialize the NTBA singleton instance
 */
const bot = new TelegramBot(TOKEN, { polling: false })

/**
 * Sets the forwarder from the HTTP to the Bot instance
 */
app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

/**
 * Registers the Webhook with the Telegram API for routing of requests
 */
bot.setWebHook(SET_WEBHOOK_PATH)

// IDK but this is likely how to make this work natively in a group setting
bot.on('my_chat_member', (msg) => {
  console.log(msg)
  sendReponse(msg.chat.id, 'Lalus 1')
})

// IDK but this is likely how to make this work natively in a group setting
bot.on('chat_member', (msg) => {
  console.log(msg)
  sendReponse(msg.chat.id, 'Lalus 2')
})

/**
 * Processes '/question' command
 */
bot.onText(/\/question (.+)/, (msg, match) => {
  //Add logic to process questions sent. Checkout the msg object.
  // Return a response. Now just echoes user input.

  const question = match[1]
  const newPrompt = {
    prompt: question,
    completion: 'IDK where this data comes from',
  }

  addPrompt(newPrompt)

  bot.sendMessage(msg.chat.id, `${question}`)
})

/**
 * Processes '/answer' command
 */
bot.onText(/\/answer (.+)/, (msg, match) => {
  //Add logic to process questions sent. Checkout the msg object.
  // Return a response. Now just echoes user input.

  const answer = match[1]
  bot.sendMessage(msg.chat.id, `Here's what I got: ${answer}`)
})

/**
 * Sends chat messages to channels or users
 * @param {string} chatId Unique ID of a respective chat.
 * @param {string} msg Content to be returned to user.
 */
async function sendReponse(chatId, msg) {
  await bot.sendMessage(chatId, msg)
}

app.listen(process.env.PORT || 5000, async () => {
  console.log('🚀 app running on port', process.env.PORT || 5000)
  console.log(SET_WEBHOOK_PATH)
})

function addPrompt(newPrompt) {
  // Convert the JSON object to a JSON string
  const newJsonLine = JSON.stringify(newPrompt)

  const jsonlFilePath = './data.jsonl'

  // Read the existing JSONL file and append the new JSON string as a new line
  fs.appendFile(jsonlFilePath, `\n${newJsonLine}`, (error) => {
    if (error) {
      console.error('An error occurred while appending to the file:', error)
    } else {
      console.log('JSON object appended to the JSONL file successfully')
    }
  })
}

/*** One on one response. Can be useful depending on commands we choose to add
bot.on('message', (msg) => {
  console.log(msg)
  sendReponse(msg.chat.id, msg.text)
})
 */
