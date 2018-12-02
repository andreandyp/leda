// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const { ActivityTypes } = require('botbuilder');
const request = require('request-promise-native');

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            let num = Math.trunc(Math.random() * 4);
            let frases = ['¿Quieres contarme más?', 'Vaya...', 'Oh', 'Sígueme contando'];
            await turnContext.sendActivity(frases[num]);
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            if (turnContext.activity.membersAdded[0].name === 'Bot') {
                return;
            }
            try {
                let response = await request({ method: 'GET', uri: 'http://localhost:3001/' });
                if (!response) {
                    await turnContext.sendActivity('No has iniciado sesión, tu historial no se guardará');
                } else {
                    await turnContext.sendActivity(`Hola ${ response }`);
                }

                await turnContext.sendActivity(JSON.parse(`{
  "type": "message",
  "text": "Cuéntame acerca de ti",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
          {
            "type": "TextBlock",
            "text": "¿No sabes por dónde empezar? Contesta una de estas preguntas:"
          },
          {
            "type": "TextBlock",
            "text": "*¿Cómo estas?* *¿Cómo te sientes?* *¿Qué tal tu día?*",
            "separation": "none"
          },
          {
            "type": "TextBlock",
            "text": "Entre más información me des, mejor"
          }
        ]
      }
    }
  ]
}`));
            } catch (error) {
                console.log(error);
            }
        } else {
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

exports.EchoBot = EchoBot;
