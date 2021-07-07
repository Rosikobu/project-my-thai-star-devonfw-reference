/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const ngrokLink = "65b9b5a7aa63.ngrok.io";

const http = require('http');
const https = require('https');

var orderLines = [];

var lastBooking = null;

const repromptOutput = "Entschuldigung, das habe ich nicht verstanden. Du kannst einen Tisch buchen, die Speisekarte ausgeben lassen oder Essen bestellen."

const alexaApiCall = function(hostname, path, apiAccessToken) {
    let options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'Host': hostname,
            'Accept': 'application/json',
            'Authorization': "Bearer " + apiAccessToken,
        }
    }
    
    return new Promise((resolve, reject) => {
        let request = https.request(options, response => {
            
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

        request.end();
    });
}

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
        const speakOutput = 'Willkommen bei My Thai Star! Falls du Hilfe brauchst, sag einfach "Hilfe!"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CreateBookingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CreateBookingIntent';
    },
    async handle(handlerInput) {
        
        if(handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED"){
            return handlerInput.responseBuilder
                .speak("Okay, deine Buchung wird verworfen.")
                .reprompt(repromptOutput)
                .getResponse();
        }

        let name = handlerInput.requestEnvelope.request.intent.slots.name.value;
        let date = handlerInput.requestEnvelope.request.intent.slots.date.value;
        let time = handlerInput.requestEnvelope.request.intent.slots.time.value;
        let assistants = handlerInput.requestEnvelope.request.intent.slots.assistants.value;
        
        let apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
        let apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint.slice(8);
        
        let speakOutput = "";
        
        try {
            
            let email = await alexaApiCall(apiEndpoint, "/v2/accounts/~current/settings/Profile.email", apiAccessToken);
            
            let httpBody = {
                booking: {
                   bookingDate: date + "T"+ time + ":00.000Z",
                   name: name,
                   email: email.replace(/"/g, ''),
                   assistants: assistants
                }
            };
        
            let httpBodyString = JSON.stringify(httpBody);
            
            let serverResponse = await postHttp(ngrokLink, "/mythaistar/services/rest/bookingmanagement/v1/booking", httpBodyString);
            
            let serverResponseObject = JSON.parse(serverResponse);
            
            if(serverResponseObject.hasOwnProperty('bookingToken')){
                speakOutput += "Die Buchung war erfolgreich. Wir senden dir in Kürze eine Bestellbestätigung an deine verlinkte Mail-Adresse.";
                
                lastBooking = {
                    time: time,
                    date: date,
                    name: name,
                    assistants: assistants,
                    bookingToken: serverResponseObject.bookingToken,
                    comment: "Booking Type Alexa"
                }
                
            } else {
                speakOutput += "Die Buchung ist leider fehlgeschlagen.";
            }
           
            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
               
        } catch(error) {
            handlerInput.responseBuilder
                .speak("Die Buchung ist leider fehlgeschlagen.")
                .reprompt(repromptOutput)
        }
       
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const ReadMenuIncompleteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadMenuIntent'
            && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED";
    },
    handle(handlerInput) {
        
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
      
    }
};

const ReadUnfilteredMenuIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadMenuIntent'
            && handlerInput.requestEnvelope.request.intent.slots.filter.value
            && handlerInput.requestEnvelope.request.intent.slots.filter.resolutions
            && handlerInput.requestEnvelope.request.intent.slots.filter.resolutions.resolutionsPerAuthority[0].values
            && handlerInput.requestEnvelope.request.intent.slots.filter.resolutions.resolutionsPerAuthority[0].values[0].value.id === "0";
    },
    async handle(handlerInput) {
        
        let speakOutput = "";
        
        try {
            
            let httpBody = {
                categories: [],
                searchBy: "",
                pageable: {
                    pageSize: 50,
                    pageNumber: 0,
                    sort: [
                        {
                            property: "price",
                            direction: "DESC"
                        }
                    ]
                },
                maxPrice: null,
                minLikes: null
            }
            
            let httpBodyString = JSON.stringify(httpBody);
            
            let serverResponse = await postHttp(ngrokLink, "/mythaistar/services/rest/dishmanagement/v1/dish/search", httpBodyString);
            
            let responseObject = JSON.parse(serverResponse);
            
            let dishes = responseObject.content;
            
            if(dishes.length === 0){
                
                speakOutput += "Leider können wir dir heute nichts anbieten."
                
            } else if(dishes.length === 1) {
                
                speakOutput += "Heute gibt es: "+dishes[0].dish.name;
                
            } else {
                
                speakOutput += "Heute gibt es: ";
                
                for(let i = 0; i < dishes.length -2; i++){
                    speakOutput += dishes[i].dish.name + ", ";
                }
                
                speakOutput += dishes[dishes.length-2].dish.name + " und " + dishes[dishes.length-1].dish.name;
            }
            
            handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            
        } catch (error) {
            handlerInput.responseBuilder
                .speak("Leider gab es einen Fehler beim Auslesen der Speisekarte.")
                .reprompt(repromptOutput)
        }
       
    
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const ReadFilteredMenuIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadMenuIntent'
            && handlerInput.requestEnvelope.request.intent.slots.filterCategory.value
            && handlerInput.requestEnvelope.request.intent.slots.filterCategory.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH";
    },
    async handle(handlerInput) {
        
        let speakOutput = "";
        
        let category = handlerInput.requestEnvelope.request.intent.slots.filterCategory.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        
        if(category === "-1") {
            return handlerInput.responseBuilder
                .addDelegateDirective({
                    name: 'ReadMenuIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                       filter: {
                           name: "filter",
                           value: "yes"
                       },
                       filterCategory:{
                           name: "filterCategory",
                           value: ""
                       },
                       isDone:{
                           name: "isDone",
                           value: ""
                       }
                    }
                })
                .speak("Mögliche Kategorien sind Hauptgerichte, Vorspeisen, Desserts, Nudeln, Reis, Curry, Vegan und Vegetarisch.")
                .getResponse();
        }
        
        let filter = [{id: category}];
        
        try {
            
            let httpBody = {
                categories: filter,
                searchBy: "",
                pageable: {
                    pageSize: 50,
                    pageNumber: 0,
                    sort: [
                        {
                            property: "name",
                            direction: "ASC"
                        }
                    ]
                },
                maxPrice: null,
                minLikes: null
            }
            
            let httpBodyString = JSON.stringify(httpBody);
            
            let serverResponse = await postHttp(ngrokLink, "/mythaistar/services/rest/dishmanagement/v1/dish/search", httpBodyString);
            
            if(serverResponse){
                let responseObject = JSON.parse(serverResponse);   
                
                let dishes = responseObject.content;
                
                if(dishes.length === 1) {
                    
                    speakOutput += "Heute gibt es: " + dishes[0].dish.name;
                    
                } else {
                    
                    speakOutput += "Heute gibt es: ";
                    
                    for(let i = 0; i < dishes.length -2; i++){
                        speakOutput += dishes[i].dish.name + ", ";
                    }
                    
                    speakOutput += dishes[dishes.length-2].dish.name + " und " + dishes[dishes.length-1].dish.name;
                }
            } else {
                speakOutput += "Leider können wir dir heute nichts anbieten."
            }
            
            handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            
        } catch (error) {
            handlerInput.responseBuilder
                .speak("Leider gab es einen Fehler beim Auslesen der Speisekarte.")
                .reprompt(repromptOutput)
        }
       
    
        return handlerInput.responseBuilder
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

const OrderFoodCheckDeliveryIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.intent.slots.where.value
            && handlerInput.requestEnvelope.request.intent.slots.where.resolutions.resolutionsPerAuthority[0].values[0].value.id === "delivery";
    },
    handle(handlerInput) {
        
        return handlerInput.responseBuilder
            .addDelegateDirective({
                name: 'AddDishToOrderIntent',
                confirmationStatus: 'NONE',
                slots: {
                        where: {
                            name: "where",
                            value: "delivery"
                        },
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
             })
             .getResponse();
    }
};

const OrderFoodCheckInhouseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.intent.slots.where.value
            && handlerInput.requestEnvelope.request.intent.slots.where.resolutions.resolutionsPerAuthority[0].values[0].value.id === "inhouse";
    },
    handle(handlerInput) {
        
        if(lastBooking !== null){
            handlerInput.responseBuilder
                .speak(`Die letzte Buchung ist auf den Namen ${lastBooking.name} am ${lastBooking.date} um ${lastBooking.time} für ${lastBooking.assistants} Personen. Möchtest du auf diese Buchung bestellen?`)
                .addElicitSlotDirective('correctBooking')
        } else {
            handlerInput.responseBuilder
                .speak('Du hast noch keine Buchung getätigt. Bitte buche zunächst einen Tisch. Für ältere Buchungen benutze bitte die "My Thai Star" Website.')
                .reprompt(repromptOutput)
        }
        
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const OrderFoodCheckInhouseCorrectBookingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderFoodIntent'
            && handlerInput.requestEnvelope.request.intent.slots.where.value
            && handlerInput.requestEnvelope.request.intent.slots.where.resolutions.resolutionsPerAuthority[0].values[0].value.id === "inhouse"
            && handlerInput.requestEnvelope.request.intent.slots.correctBooking.value;
    },
    handle(handlerInput) {
        const bookingCorrect = handlerInput.requestEnvelope.request.intent.slots.correctBooking.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        
        if(bookingCorrect === "0"){
            handlerInput.responseBuilder
            .speak('Du kannst nur auf die letzte Buchung die in dieser Session getätigt wurde Essen bestellen. Bitte benutze für ältere Buchungen die "My Thai Star Website".')
            .reprompt(repromptOutput)
        } else {
            handlerInput.responseBuilder
                .addDelegateDirective({
                name: 'AddDishToOrderIntent',
                confirmationStatus: 'NONE',
                slots: {
                        where: {
                            name: "where",
                            value: "inhouse"
                        },
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
        }
        return handlerInput.responseBuilder
            .getResponse();
    }
};

const AddDishToOrderIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddDishToOrderIntent'
            && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED";
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }
};

const AddDishToOrderCorrectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddDishToOrderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.value
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values
            && handlerInput.requestEnvelope.request.intent.slots.isCorrect.resolutions.resolutionsPerAuthority[0].values[0].value.id==="1";
            
    },
    handle(handlerInput) {
        
            
        const count = handlerInput.requestEnvelope.request.intent.slots.count.value;
        
        const dishId = handlerInput.requestEnvelope.request.intent.slots.dish.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        
        let orderLine = {orderLine: {amount: count, comment: "", dishId: dishId}, extras: []};
        
        orderLines.push(orderLine);
        
        return handlerInput.responseBuilder
            .speak("Okay, das Gericht wurde deiner Bestellung hinzugefügt.")
            .reprompt(repromptOutput)
            .addDelegateDirective({
                    name: 'OrderAgainIntent',
                    confirmationStatus: 'NONE',
                    slots: {
                        where: {
                            name: "where",
                            value: handlerInput.requestEnvelope.request.intent.slots.where.value
                        },
                        orderAgain: {
                           name: "orderAgain",
                           value: ""
                        }
                    }
            })
            .getResponse();
            
    }
};

const AddDishToOrderIncorrectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddDishToOrderIntent'
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
                            name: 'AddDishToOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                where: {
                                    name: "where",
                                    value: handlerInput.requestEnvelope.request.intent.slots.where.value
                                },
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
                            name: 'AddDishToOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                where: {
                                    name: "where",
                                    value: handlerInput.requestEnvelope.request.intent.slots.where.value
                                },
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
                            name: 'AddDishToOrderIntent',
                            confirmationStatus: 'NONE',
                            slots: {
                                where: {
                                    name: "where",
                                    value: handlerInput.requestEnvelope.request.intent.slots.where.value
                                },
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
        
        let where = handlerInput.requestEnvelope.request.intent.slots.where.value;
        
        if(handlerInput.requestEnvelope.request.intent.slots.orderAgain.resolutions.resolutionsPerAuthority[0].values[0].value.id === "0"){
            
            if(orderLines.length > 0){
                
                try {
                    
                    var bookingToken;
                
                    if(where === 'delivery') {
                        
                        const serviceClientFactory = handlerInput.serviceClientFactory;
                        const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
                        
                        let userTimeZone;
                        const upsServiceClient = serviceClientFactory.getUpsServiceClient();
                        userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
                        
                        const currentDateTime = new Date(new Date().toLocaleString("en-US", {timeZone: userTimeZone}));
                        
                        const bookingDateTime = new Date(currentDateTime.getTime() + 600000);
                        
                        const bookingYear = bookingDateTime.getFullYear()
                        const bookingMonth = bookingDateTime.getMonth() + 1;
                        const bookingDay = bookingDateTime.getDate();
                        
                        const bookingDate = bookingYear + "-" + (bookingMonth > 9 ? bookingMonth  : "0" + bookingMonth) + "-" + bookingDay;
                        const bookingTime = bookingDateTime.getHours() + ":" + bookingDateTime.getMinutes();
                        
                        let apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
                        let apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint.slice(8);
                        
                        let email = await alexaApiCall(apiEndpoint, "/v2/accounts/~current/settings/Profile.email", apiAccessToken);
                        
                        let httpBodyBooking = {
                            booking: {
                                bookingDate: bookingDate + "T" + bookingTime + ":00.000Z",
                                name: "delivery",
                                email: email.replace(/"/g, ''),
                                delivery: "true"
                            }
                        }
                        
                        let httpBodyBookingString = JSON.stringify(httpBodyBooking);
            
                        let serverResponse = await postHttp(ngrokLink, "/mythaistar/services/rest/bookingmanagement/v1/booking", httpBodyBookingString);
            
                        let serverResponseObject = JSON.parse(serverResponse);
                        
                        bookingToken = serverResponseObject.bookingToken;
                        
                    } else {
                        
                        bookingToken = lastBooking.bookingToken;
                        
                    }
                    
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
                            .speak("Vielen Dank, deine Bestellung wurde abgeschickt!")
                            .reprompt(repromptOutput);
                            
                        orderLines = [];
                        
                    } else {
                        handlerInput.responseBuilder
                            .speak("Leider gab es einen Fehler bei der Bestellung.")
                            .reprompt(repromptOutput);
                            
                        orderLines = [];    
                    }
                    
                } catch(error){
                    handlerInput.responseBuilder
                        .speak(`Leider gab es einen Fehler bei der Bestellung.`)
                        .reprompt(repromptOutput);
                        
                    orderLines = [];
                }
            } else {
            
                handlerInput.responseBuilder
                    .speak("Okay, dann bestelle ich nichts.")
                    .reprompt(repromptOutput);
                
            }
                
        } else {
            
            handlerInput.responseBuilder
                .addDelegateDirective({
                        name: 'AddDishToOrderIntent',
                        confirmationStatus: 'NONE',
                        slots: {
                            where: {
                                name: "where",
                                value: where
                            },
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
        const speakOutput = 'My Thai Star bietet viele verschiedene Funktionen. Versuch doch zum Beispiel einen Tisch zu buchen, Essen zu bestellen oder die Speisekarte vorlesen zu lassen.';

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
        const speakOutput = 'Auf Wiedersehen!';

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
        const speakOutput = 'Entschuldigung, da kann ich leider nicht weiterhelfen. Versuche es bitte noch einmal.';

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
        const speakOutput = error+' Entschuldigung, da ist wohl etwas schiefgelaufen. Versuche es bitte noch einmal.';
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
        CreateBookingIntentHandler,
        ReadUnfilteredMenuIntentHandler,
        ReadFilteredMenuIntentHandler,
        ReadMenuIncompleteIntentHandler,
        OrderFoodCheckInhouseCorrectBookingIntentHandler,
        OrderFoodCheckInhouseIntentHandler,
        OrderFoodCheckDeliveryIntentHandler,
        OrderFoodIntentHandler,
        AddDishToOrderCorrectIntentHandler,
        AddDishToOrderIncorrectIntentHandler,
        AddDishToOrderIntentHandler,
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