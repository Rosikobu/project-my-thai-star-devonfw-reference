/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

var ngrokLink = "65b9b5a7aa63.ngrok.io";

const http = require('http');

var orderLines = [];

var tableId;

const postHttp = function(hostname, path, data) {
    
    let options = {
        hostname: hostname,
        port: 80,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
        
    }
    
    return new Promise((resolve, reject) => {
        let request = http.request(options, response => {
            
            let returnData = "";
            
            response.on('data', chunk => {
                returnData += chunk;
            });
            
            response.on('end', () => {
                resolve(returnData);
            });
            
            request.on('error', error => {
                reject(error);
            })
        });

        request.write(data);
        request.end();
    });
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {

        return handlerInput.responseBuilder
            .addDelegateDirective({
                name: 'GetTableIdIntent',
                confirmationStatus: 'NONE'
             })
             .getResponse();
    }
};

const GetTableIdCompleteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTableIdIntent'
            && handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
    },
    handle(handlerInput) {
        
        tableId = handlerInput.requestEnvelope.request.intent.slots.tableId.value;

        return handlerInput.responseBuilder
            .addDelegateDirective({
                name: 'OrderFoodIntent',
                confirmationStatus: 'NONE'
             })
             .getResponse();
    }
};

const OrderFoodIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED";
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }
};

const OrderFoodCorrectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.value
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values[0].value.id==="1";
            
    },
    handle(handlerInput) {
            
        const count = handlerInput.requestEnvelope.request.intent.slots.count.value;
            
        const dishId = handlerInput.requestEnvelope.request.intent.slots.dish.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            
        let orderLine = {orderLine: {amount: count, comment: "", dishId: dishId}, extras: []};
            
        orderLines.push(orderLine);
            
        handlerInput.responseBuilder
                .speak("Okay, das Gericht wurde deiner Bestellung hinzugefügt.")
        
        return handlerInput.responseBuilder
            .addDelegateDirective({
                    name: 'OrderAgainIntent',
                    confirmationStatus: 'NONE'
            })
            .getResponse();
    }
};

const OrderFoodIncorrectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.value
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values[0].value.id==="0";
    },
    handle(handlerInput) {
        
        if(!handlerInput.requestEnvelope.request.intent.slots.whatsWrong.value || !handlerInput.requestEnvelope.request.intent.slots.whatsWrong.resolutions.resolutionsPerAuthority[0].values){
            
            handlerInput.responseBuilder
                .addDelegateDirective();
        } else {
            
            switch(handlerInput.requestEnvelope.request.intent.slots.whatsWrong.resolutions.resolutionsPerAuthority[0].values[0].value.id) {
                case "dish":
                    handlerInput.responseBuilder
                        .addDelegateDirective({
                            name: 'OrderFoodIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                dish: {
                                   name: "dish",
                                   value: ""
                                },
                                count: {
                                   name: "count",
                                   value: handlerInput.requestEnvelope.request.intent.slots.count.value
                                },
                                isCorrect: {
                                   name: "isCorrect",
                                   value: ""
                                },
                                whatsWrong: {
                                   name: "whatsWrong",
                                   value: ""
                                },
                                isDone: {
                                    name: "isDone",
                                    value: ""
                                }
                            }
                        });
                    break;
                
                case "count":
                    handlerInput.responseBuilder
                        .addDelegateDirective({
                            name: 'OrderFoodIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                dish: {
                                   name: "dish",
                                   value: handlerInput.requestEnvelope.request.intent.slots.dish.value
                                },
                                count: {
                                   name: "count",
                                   value: ""
                                },
                                isCorrect: {
                                   name: "isCorrect",
                                   value: ""
                                },
                                whatsWrong: {
                                   name: "whatsWrong",
                                   value: ""
                                },
                                isDone: {
                                    name: "isDone",
                                    value: ""
                                }
                            }
                        });
                    break;
                
                case "both":
                    handlerInput.responseBuilder
                        .addDelegateDirective({
                            name: 'OrderFoodIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                dish: {
                                   name: "dish",
                                   value: ""
                                },
                                count: {
                                   name: "count",
                                   value: ""
                                },
                                isCorrect: {
                                   name: "isCorrect",
                                   value: ""
                                },
                                whatsWrong: {
                                   name: "whatsWrong",
                                   value: ""
                                },
                                isDone: {
                                    name: "isDone",
                                    value: ""
                                }
                            }
                        });
                    break;    
            }
            
        }
        
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const OrderAgainIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderAgainIntent'
            && handlerInput.requestEnvelope.request.intent.slots.orderAgain.value
            && handlerInput.requestEnvelope.request.intent.slots.orderAgain.resolutions.resolutionsPerAuthority[0].values;
            
    },
    async handle(handlerInput) {
        
        if(handlerInput.requestEnvelope.request.intent.slots.orderAgain.resolutions.resolutionsPerAuthority[0].values[0].value.id === "0"){
            
            if(orderLines.length > 0){
                
                try {
                        
                    const serviceClientFactory = handlerInput.serviceClientFactory;
                    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
                    
                    let userTimeZone;
                    const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                    userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
                    
                    const currentDateTime = new Date(new Date(new Date().toLocaleString("en-US", {timeZone: userTimeZone})).getTime() + 7200000 );
                    
                    const currentYear = currentDateTime.getFullYear()
                    const currentMonth = currentDateTime.getMonth() + 1;
                    const currentDay = currentDateTime.getDate();
                    
                    const currentDate = currentYear + "-" + (currentMonth > 9 ? currentMonth  : "0" + currentMonth) + "-" + currentDay;
                    const currentTime = (currentDateTime.getHours() > 9 ? currentDateTime.getHours() : "0" + currentDateTime.getHours()) + ":" + (currentDateTime.getMinutes() > 9 ? currentDateTime.getMinutes() : "0" + currentDateTime.getMinutes());
                    
                    let httpBodyBooking = {
                        bookingDate: currentDate + "T" + currentTime + ":00.000Z",
                        tableId: tableId
                    }
                    
                    let httpBodyBookingString = JSON.stringify(httpBodyBooking);
        
                    let serverResponseBooking = await postHttp(ngrokLink, "/mythaistar/services/rest/bookingmanagement/v1/booking/findBy", httpBodyBookingString);
        
                    let serverResponseBookingObject = JSON.parse(serverResponseBooking);
                    
                    var bookingToken = serverResponseBookingObject.bookingToken;
                    
                    let httpBody = {
                        booking: {
                            bookingToken: bookingToken
                        },
                        orderLines: orderLines
                    }
                    
                    let httpBodyString = JSON.stringify(httpBody);
                    
                    let serverResponse = await postHttp(ngrokLink, "/mythaistar/services/rest/ordermanagement/v1/order", httpBodyString);
                        
                    let serverResponseObject = JSON.parse(serverResponse);
            
                    if(serverResponseObject.hasOwnProperty('id')){
                        
                        handlerInput.responseBuilder
                            .speak("Vielen Dank, deine Bestellung wurde abgeschickt!");
                            
                        orderLines = [];
                        
                    } else {
                        handlerInput.responseBuilder
                            .speak("Leider gab es einen Fehler bei der Bestellung.");
                            
                        orderLines = [];    
                    }
                    
                } catch(error){
                    handlerInput.responseBuilder
                        .speak(error+` Leider gab es einen Fehler bei der Bestellung.`);
                        
                    orderLines = [];
                }
            } else {
            
                handlerInput.responseBuilder
                    .speak("Okay, dann bestelle ich nichts.");
                
            }
                
        } else {
            
            handlerInput.responseBuilder
                .addDelegateDirective({
                    name: 'OrderFoodIntent',
                    confirmationStatus: 'NONE'
                })
        }
        
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetTableIdCompleteIntentHandler,
        OrderFoodCorrectIntentHandler,
        OrderFoodIncorrectIntentHandler,
        OrderFoodIntentHandler,
        OrderAgainIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();