const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
const date = require('dayjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const AWS = require('aws-sdk');
const base64Img = require('base64-img');
const bodyParser = require('body-parser');
const { checkAdmin, checkAmbassador, checkUser } = require('./middleware/request');
const { Users, EventCategoriesData, EventSubCategories, EventsRecords, BusinessCategoryTags,
    EventsFAQs, EventPricingPlans, CommunityCategoriesData, CommunityRecords, CommunityFAQs, EventCategoryTags,
    BusinessRecords, BusinessesCategoriesData, BusinessFAQs, BusinessOffering, NewAmbassadors, Ambassadors,
    NewAdministrator, Administrator, State, LocalGovernment, savedEvents, savedCommunities, savedBusinesses, communityMembers, eventReviews, businessReviews, communityReviews, CommunityCategoryTags } = require('./connection');
const { default: axios } = require('axios');

const app = express();

const apiRouter = express.Router();
const adminRouter = express.Router();
const ambassadorRouter = express.Router();

var s3 = new AWS.S3({
    // accessKeyId: "AKIAUP7OQTR3CWKUHGGM",
    // secretAccessKey: "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"
    accessKeyId: "AKIAT5KWYFQ3SFY2JGPR",
    secretAccessKey: "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",
    correctClockSkew: true
});

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(cors({
//     origin: 'http://localhost:3000'
// }))
app.use(cors({
    origin: '*'
}))

app.use('/api/v1/cowrywealth', apiRouter);
app.use('/api/v1/cowrywealth/admin', adminRouter);
app.use('/api/v1/cowrywealth/ambassador', ambassadorRouter);

apiRouter.get('/', (req, res) => {
    res._construct.send("API works fine")
})

apiRouter.get('/get_all_events', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }, {
            model: EventPricingPlans
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Events fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_event_categories', (req, res) => {
    EventCategoriesData.findAll({
        include: [{
            model: EventsRecords
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_community_categories', (req, res) => {
    CommunityCategoriesData.findAll({
        include: [{
            model: CommunityRecords
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching community categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/events/:eventId', (req, res) => {
    EventsRecords.findOne({
        where: {
            id: req.params.eventId
        },
        include: [{
            model: EventCategoriesData
        }, {
            model: EventsFAQs
        }, {
            model: EventPricingPlans
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Event fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching event',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_communities', (req, res) => {
    CommunityRecords.findAll({
        include: [{
            model: CommunityCategoriesData
        }, {
            model: communityReviews
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Communities fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching communities',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/communities/:communityId', (req, res) => {
    CommunityRecords.findOne({
        where: {
            id: req.params.communityId
        },
        include: [{
            model: CommunityCategoriesData
        }, {
            model: CommunityFAQs
        }]
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Community fetched successfully',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching communities',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_businesses', (req, res) => {
    BusinessRecords.findAll({
        include: [{
            model: BusinessesCategoriesData
        }, {
            model: businessReviews
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    })
        .then(allBusinesses => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Businesses fetched successfully',
                message: allBusinesses
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching businesses',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/businesses/:communityId', (req, res) => {
    BusinessRecords.findOne({
        where: {
            id: req.params.communityId
        },
        include: [{
            model: BusinessesCategoriesData
        }, {
            model: BusinessFAQs
        }, {
            model: BusinessOffering
        }]
    })
        .then(allBusiness => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Business fetched successfully',
                message: allBusiness
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching business',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_data', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }]
    })
        .then(eventsData => {
            CommunityRecords.findAll({
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(communitiesData => {
                    BusinessRecords.findAll({
                        include: [{
                            model: BusinessesCategoriesData
                        }]
                    })
                        .then(businessData => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Data fetched successfully',
                                summary: 'success',
                                message: {
                                    eventsData,
                                    communitiesData,
                                    businessData
                                }
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'failure',
                                summary: 'An error occurred while trying to fetch data. Please try again.',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to fetch data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/updatefullName', checkUser, (req, res) => {
    Users.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }, {
        where: {
            id: res.body.id
        }
    })
        .then(userData => {
            Users.findOne({
                where: {
                    id: res.body.id
                }
            })
                .then(userDone => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'User updated successfully',
                        message: userDone
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to update data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})
apiRouter.post('/updateUserExtraBasic', checkUser, (req, res) => {
    Users.update({
        gender: req.body.gender,
        phoneNumber: req.body.phoneNumber
    }, {
        where: {
            id: res.body.id
        }
    })
        .then(userData => {
            Users.findOne({
                where: {
                    id: res.body.id
                }
            })
                .then(userDone => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'User updated successfully',
                        message: userDone
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to update data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/updateAddress', checkUser, (req, res) => {
    Users.update({
        StateId: req.body.userState,
        lga: req.body.userLGA,
        address: req.body.address
    }, {
        where: {
            id: res.body.id
        }
    })
        .then(userData => {
            Users.findOne({
                where: {
                    id: res.body.id
                }
            })
                .then(userDone => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'User updated successfully',
                        message: userDone
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to update data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/updateProfilePicture', checkUser, (req, res) => {
    const url = './images' + Date.now();
    base64Img.img(req.body.mainImage, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${req.body.firstName}${req.body.lastName}${res.body.id}_${new Date()}`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let secondImage = data.Location;
            Users.update({
                profilePicture: secondImage
            }, {
                where: {
                    id: res.body.id
                }
            })
                .then(userData => {
                    Users.findOne({
                        where: {
                            id: res.body.id
                        }
                    })
                        .then(userDone => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'success',
                                summary: 'User updated successfully',
                                message: userDone
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'failure',
                                summary: 'An error occurred while trying to update data. Please try again.',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to update data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
    })
})

apiRouter.post('/addsavedevent', checkUser, (req, res) => {
    savedEvents.findOne({
        where: {
            UserId: res.body.id,
            EventsRecordId: req.body.eventsId
        }
    })
        .then(saved => {
            if (saved) {
                savedEvents.destroy({
                    where: {
                        UserId: res.body.id,
                        EventsRecordId: req.body.eventsId
                    }
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'removed'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                savedEvents.create({
                    UserId: res.body.id,
                    EventsRecordId: req.body.eventsId
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'added'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/addsavedcommunity', checkUser, (req, res) => {
    savedCommunities.findOne({
        where: {
            UserId: res.body.id,
            CommunityRecordId: req.body.communitiesId
        }
    })
        .then(saved => {
            if (saved) {
                savedCommunities.destroy({
                    where: {
                        UserId: res.body.id,
                        CommunityRecordId: req.body.communitiesId
                    }
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'removed'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                savedCommunities.create({
                    UserId: res.body.id,
                    CommunityRecordId: req.body.communitiesId
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'added'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/addsavedbusinesses', checkUser, (req, res) => {
    savedBusinesses.findOne({
        where: {
            UserId: res.body.id,
            BusinessRecordId: req.body.businessesId
        }
    })
        .then(saved => {
            if (saved) {
                savedBusinesses.destroy({
                    where: {
                        UserId: res.body.id,
                        BusinessRecordId: req.body.businessesId
                    }
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'removed'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                savedBusinesses.create({
                    UserId: res.body.id,
                    BusinessRecordId: req.body.businessesId
                })
                    .then(userData => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'User updated successfully',
                            summary: 'success',
                            message: {
                                action: 'added'
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to update data. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/likedEvents/:eventId', checkUser, (req, res) => {
    savedEvents.findOne({
        where: {
            EventsRecordId: req.params.eventId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Event found',
                    summary: 'success',
                    message: 'saved'
                };
                res.json(successMessage);
            } else {
                let successMessage = {
                    statusCode: 400,
                    statusMessage: 'Event not found',
                    summary: 'error',
                    message: ''
                };
                res.json(successMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/likedBusinesses/:eventId', checkUser, (req, res) => {
    savedBusinesses.findOne({
        where: {
            BusinessRecordId: req.params.eventId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Event found',
                    summary: 'success',
                    message: 'saved'
                };
                res.json(successMessage);
            } else {
                let successMessage = {
                    statusCode: 400,
                    statusMessage: 'Event not found',
                    summary: 'error',
                    message: ''
                };
                res.json(successMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/likedCommunities/:eventId', checkUser, (req, res) => {
    savedCommunities.findOne({
        where: {
            CommunityRecordId: req.params.eventId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'success',
                    summary: 'Event found',
                    message: 'saved'
                };
                res.json(successMessage);
            } else {
                let successMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'Event not found',
                    message: ''
                };
                res.json(successMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedevents', checkUser, (req, res) => {
    savedEvents.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: EventsRecords
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedbusinesses', checkUser, (req, res) => {
    savedBusinesses.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: BusinessRecords,
            include: [{
                model: BusinessesCategoriesData
            }]
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedcommunities', checkUser, (req, res) => {
    savedCommunities.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: CommunityRecords
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to update data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedeventscomments', checkUser, (req, res) => {
    eventReviews.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: EventsRecords
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedcommunitycomments', checkUser, (req, res) => {
    communityReviews.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: CommunityRecords
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allusersavedbusinesscomments', checkUser, (req, res) => {
    businessReviews.findAll({
        where: {
            UserId: res.body.id
        },
        include: [{
            model: BusinessRecords
        }]
    })
        .then(saved => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Data fetched successfully',
                summary: 'success',
                message: saved
            };
            res.json(successMessage)
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/deleteEventReview', checkUser, (req, res) => {
    eventReviews.findOne({
        where: {
            id: req.body.reviewId,
            UserId: res.body.id
        }
    })
        .then(reviewFound => {
            if (reviewFound) {
                eventReviews.destroy({
                    where: {
                        id: req.body.reviewId,
                        UserId: res.body.id
                    }
                })
                    .then(allEvents => {
                        eventReviews.findAll({
                            where: {
                                UserId: res.body.id
                            },
                            include: [{
                                model: EventsRecords
                            }]
                        })
                            .then(reviews => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'success',
                                    summary: 'Events reviews deleted successfully',
                                    message: reviews
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'failure',
                                    summary: 'An error occurred while deleting events reviews',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while fetching events reviews',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'An error occurred while deleting events review',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting events review',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/deleteCommunityReview', checkUser, (req, res) => {
    communityReviews.findOne({
        where: {
            id: req.body.reviewId,
            UserId: res.body.id
        }
    })
        .then(reviewFound => {
            if (reviewFound) {
                communityReviews.destroy({
                    where: {
                        id: req.body.reviewId,
                        UserId: res.body.id
                    }
                })
                    .then(allEvents => {
                        communityReviews.findAll({
                            where: {
                                UserId: res.body.id
                            },
                            include: [{
                                model: CommunityRecords
                            }]
                        })
                            .then(reviews => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'success',
                                    summary: 'Community reviews deleted successfully',
                                    message: reviews
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'failure',
                                    summary: 'An error occurred while deleting community reviews',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while fetching community reviews',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'An error occurred while deleting community review',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting community review',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/deleteBusinessReview', checkUser, (req, res) => {
    businessReviews.findOne({
        where: {
            id: req.body.reviewId,
            UserId: res.body.id
        }
    })
        .then(reviewFound => {
            if (reviewFound) {
                businessReviews.destroy({
                    where: {
                        id: req.body.reviewId,
                        UserId: res.body.id
                    }
                })
                    .then(allEvents => {
                        businessReviews.findAll({
                            where: {
                                UserId: res.body.id
                            },
                            include: [{
                                model: BusinessRecords
                            }]
                        })
                            .then(reviews => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'success',
                                    summary: 'Business review deleted successfully',
                                    message: reviews
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'failure',
                                    summary: 'An error occurred while deleting community reviews',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while fetching community reviews',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'An error occurred while deleting community review',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting community review',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/joincommunity', checkUser, (req, res) => {
    communityMembers.findOne({
        where: {
            CommunityRecordId: req.body.communitiesId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Member already added',
                    summary: 'success',
                    message: {
                        present: true,
                        member: eventSaved.accepted,
                        eventSaved
                    }
                };
                res.json(successMessage);
            } else {
                communityMembers.create({
                    CommunityRecordId: req.body.communitiesId,
                    UserId: res.body.id
                })
                    .then(newMember => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Member added successfully',
                            summary: 'success',
                            message: {
                                present: true,
                                member: false,
                                eventSaved: {}
                            }
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to add user. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to save data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/unjoincommunity', checkUser, (req, res) => {
    communityMembers.findOne({
        where: {
            CommunityRecordId: req.body.communitiesId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (!eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Member not found',
                    summary: 'success',
                    message: ''
                };
                res.json(successMessage);
            } else {
                communityMembers.destroy({
                    where: {
                        CommunityRecordId: req.body.communitiesId,
                        UserId: res.body.id
                    }
                })
                    .then(newMember => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Member removed successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to remove user. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to save data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/acceptmember', checkUser, (req, res) => {
    communityMembers.findOne({
        where: {
            CommunityRecordId: req.body.communitiesId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (!eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Member not found',
                    summary: 'success',
                    message: ''
                };
                res.json(successMessage);
            } else {
                communityMembers.update({ accepted: true }, {
                    where: {
                        CommunityRecordId: req.body.communitiesId,
                        UserId: res.body.id
                    }
                })
                    .then(newMember => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Member added successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to add user. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to save data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/communityMember/:eventId', checkUser, (req, res) => {
    communityMembers.findOne({
        where: {
            CommunityRecordId: req.params.eventId,
            UserId: res.body.id
        }
    })
        .then(eventSaved => {
            if (eventSaved) {
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Member found',
                    summary: 'success',
                    message: {
                        present: true,
                        member: eventSaved.accepted,
                        eventSaved
                    }
                };
                res.json(successMessage);
            } else {
                let successMessage = {
                    statusCode: 400,
                    statusMessage: 'Event not found',
                    summary: 'error',
                    message: {
                        present: false
                    }
                };
                res.json(successMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/addEventReviews', checkUser, (req, res) => {
    eventReviews.create({
        message: req.body.message,
        star: req.body.star,
        EventsRecordId: req.body.eventId,
        UserId: res.body.id
    })
        .then(eventData => {
            if (eventData) {
                eventReviews.findAll({
                    include: [{
                        model: Users
                    }],
                    order: [[
                        'createdAt', 'DESC'
                    ]]
                })
                    .then(allReviews => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'Reviews found',
                            message: allReviews
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to add review. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'An error occurred while trying to add review. Please try again.',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to add review. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/alleventreviews', (req, res) => {
    eventReviews.findAll({
        include: [{
            model: Users
        }],
        order: [[
            'createdAt', 'DESC'
        ]]
    })
        .then(allReviews => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Reviews found',
                message: allReviews
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to add review. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/singleeventreviews/:eventId', (req, res) => {
    eventReviews.findAll({
        where: {
            EventsRecordId: req.params.eventId
        },
        include: [{
            model: Users
        }],
        order: [[
            'createdAt', 'DESC'
        ]]
    })
        .then(allReviews => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Reviews found',
                message: allReviews
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to add review. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/singlebusinessreviews/:eventId', (req, res) => {
    businessReviews.findAll({
        where: {
            BusinessRecordId: req.params.eventId
        },
        include: [{
            model: Users
        }],
        order: [[
            'createdAt', 'DESC'
        ]]
    })
        .then(allReviews => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Reviews found',
                message: allReviews
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to add review. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/singlecommunityreviews/:communityId', (req, res) => {
    communityReviews.findAll({
        where: {
            CommunityRecordId: req.params.communityId
        },
        include: [{
            model: Users
        }],
        order: [[
            'createdAt', 'DESC'
        ]]
    })
        .then(allReviews => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Reviews found',
                message: allReviews
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to add review. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

// users

apiRouter.post('/signup', (req, res) => {
    let { firstName, lastName, emailAddress, password } = req.body;
    let salt = crypto.randomBytes(16).toString('hex');

    Users.findOne({
        where: {
            emailAddress
        }
    })
        .then(async user => {
            if (user) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'There is a user with this email address already',
                    message: ''
                };
                res.json(errorMessage);
            } else {

                let scrypt = util.promisify(crypto.scrypt);

                let encryptedPassword = await scrypt(password, salt, 64);
                let hash = encryptedPassword.toString('hex');
                Users.create({
                    firstName,
                    lastName,
                    emailAddress,
                    password: `${hash}.${salt}`,
                })
                    .then(signupComplete => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'User saved successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err);
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'User could not be saved',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to sign you up. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

apiRouter.post('/signin', async (req, res) => {
    let { emailAddress, password } = req.body;
    Users.findOne({
        where: {
            emailAddress: emailAddress
        }
    })
        .then(async user => {
            if (user) {
                let scrypt = util.promisify(crypto.scrypt);
                let [userHash, userSalt] = user.password.split('.');
                try {
                    let encryptedPassword = await scrypt(password, userSalt, 64);
                    let hash = encryptedPassword.toString('hex');
                    if (user.password == `${hash}.${userSalt}`) {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'User found',
                            message: {
                                userDetails: user,
                                token: jwt.sign({ emailAddress: user.emailAddress }, 'abcdefghijklmnopqrstuvwxyz')
                            }
                        };
                        res.json(successMessage);
                    } else {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'User not found',
                            message: 'Wrong password'
                        };
                        res.json(errorMessage);
                    }
                } catch (err) {
                    console.log(err);
                }
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'User not found',
                    message: 'Wrong email'
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error ocurred while fetching user. Please try again',
                message: 'Wrong email'
            };
            res.json(errorMessage);
        })
})


apiRouter.post('/uploadevent', (req, res) => {

    let { imageUrl: displayImage, mainImageUrl: mainImage, eventTitle, eventOrganizer, eventCategory,
        eventType, eventState, eventLGA, eventAddress, eventURL, eventStarts, startTime,
        eventEnds, endTime, bodyText, wheelchair, infant, transport, traveller, backProblems, pregnant,
        recommended, physicalFitness, infantSeat, pickup, pricingType } = req.body;

    const url = './images' + Date.now();
    base64Img.img(displayImage, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${eventTitle}-small`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let firstImage = data.Location;
            const url = './images' + Date.now();
            base64Img.img(mainImage, '', url, function (err, filepath) {
                const fileContent = fs.readFileSync(filepath);
                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'afrikabucket',
                    Key: `${eventTitle}-big`, // File name you want to save as in S3
                    Body: fileContent,
                    ACL: 'public-read-write'
                };
                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let secondImage = data.Location;

                    EventsRecords.create({
                        displayImage: firstImage,
                        mainImage: secondImage,
                        eventTitle, eventOrganizer,
                        EventCategoriesDatumId: eventCategory,
                        type: eventType, StateId: eventState,
                        localGovernment: eventLGA, address: eventAddress, eventURL, eventStarts, startTime,
                        eventEnds, endTime, wheelChair: wheelchair, infant, transport, traveller, backProblems, pregnant,
                        recommended, physicalFitness, infantSeat, pickup, eventPricing: pricingType,
                        eventDescription: bodyText,
                        AmbassadorId: req.body.ambassadorId
                    })
                        .then(newEventCreated => {

                            let questionBank = [];
                            for (let questionData of Object.keys(req.body.e)) {
                                if (questionData.indexOf('faqs') !== -1) {
                                    questionBank.push(req.body.e[questionData]);
                                    // console.log(questionData)
                                }
                            }

                            for (let question of questionBank) {
                                let faqBox = [];
                                if (question.question && question.answers) {
                                    let bulkFAQs = {
                                        questions: question.question,
                                        answers: question.answers,
                                        EventsRecordId: newEventCreated.id
                                    };
                                    faqBox.push(bulkFAQs);
                                }
                                EventsFAQs.bulkCreate(faqBox)
                                    .then(updated => {
                                        console.log('done')
                                    })
                                    .catch(err => console.log(err))
                            }

                            if (pricingType === "paid") {
                                for (let questionData of Object.keys(req.body.e)) {
                                    if (questionData.indexOf('pricingData') !== -1) {
                                        questionBank.push(req.body.e[questionData]);
                                        // console.log(questionData)
                                    }
                                }

                                for (let question of questionBank) {
                                    let pricingPlanBox = [];
                                    if (question.planName && question.planPrice) {
                                        let bulkPricingPlans = {
                                            planName: question.planName,
                                            planPrice: question.planPrice.slice(1).split(',').join(''),
                                            EventsRecordId: newEventCreated.id
                                        };
                                        pricingPlanBox.push(bulkPricingPlans);
                                    }
                                    EventPricingPlans.bulkCreate(pricingPlanBox)
                                        .then(updated => {
                                            console.log('done')
                                        })
                                        .catch(err => console.log(err))
                                }
                            }


                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'New event created successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                });
            });
        })
    });
})

apiRouter.post('/uploadcommunity', (req, res) => {

    let { imageUrl: displayImage, mainImageUrl: mainImage, CommunityTitle, CommunityOrganizer, communityCategory,
        CommunityState, CommunityLGA, CommunityAddress, bodyText, wheelchair, infant, transport,
        traveller, backProblems, pregnant, recommended, physicalFitness,
        infantSeat, pickup } = req.body;

    const url = './images' + Date.now();
    base64Img.img(displayImage, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${CommunityTitle}-small`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let firstImage = data.Location;
            const url = './images' + Date.now();
            base64Img.img(mainImage, '', url, function (err, filepath) {
                const fileContent = fs.readFileSync(filepath);
                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'afrikabucket',
                    Key: `${CommunityTitle}-big`, // File name you want to save as in S3
                    Body: fileContent,
                    ACL: 'public-read-write'
                };
                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let secondImage = data.Location;

                    CommunityRecords.create({
                        displayImage: firstImage,
                        mainImage: secondImage,
                        communityName: CommunityTitle, CommunityOrganizer,
                        CommunityCategoriesDatumId: communityCategory,
                        state: CommunityState,
                        localGovernment: CommunityLGA, address: CommunityAddress, wheelChair: wheelchair, infant,
                        transport, traveller, backProblems, pregnant,
                        recommended, physicalFitness, infantSeat, pickup,
                        communityDescription: bodyText,
                        communityFacebook: req.body.e.communityFacebook,
                        communityInstagram: req.body.e.communityInstagram,
                        communityTwitter: req.body.e.communityTwitter,
                        AmbassadorId: req.body.ambassadorId
                    })
                        .then(newEventCreated => {

                            let questionBank = [];
                            for (let questionData of Object.keys(req.body.e)) {
                                if (questionData.indexOf('faqs') !== -1) {
                                    questionBank.push(req.body.e[questionData]);
                                    // console.log(questionData)
                                }
                            }

                            for (let question of questionBank) {
                                let faqBox = [];
                                if (question.question && question.answers) {
                                    let bulkFAQs = {
                                        questions: question.question,
                                        answers: question.answers,
                                        CommunityRecordId: newEventCreated.id
                                    };
                                    faqBox.push(bulkFAQs);
                                }
                                CommunityFAQs.bulkCreate(faqBox)
                                    .then(updated => {
                                        console.log('done')
                                    })
                                    .catch(err => console.log(err))
                            }

                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'New community created successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                });
            });
        })
    });
})

apiRouter.post('/uploadbusiness', (req, res) => {

    let { imageUrl: displayImage, mainImageUrl: mainImage, businessName, businessOwner, businessCategory,
        businessState, businessLGA, businessAddress, companyWebsite, staffCount, openingTime,
        phoneNumber, closingTime, companyEmail,
        bodyText, pricingType, e, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

    const url = './images' + Date.now();
    base64Img.img(displayImage, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${businessName}-small`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let firstImage = data.Location;
            const url = './images' + Date.now();
            base64Img.img(mainImage, '', url, function (err, filepath) {
                const fileContent = fs.readFileSync(filepath);
                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'afrikabucket',
                    Key: `${businessName}-big`, // File name you want to save as in S3
                    Body: fileContent,
                    ACL: 'public-read-write'
                };
                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let secondImage = data.Location;

                    BusinessRecords.create({
                        displayImage: firstImage,
                        mainImage: secondImage,
                        businessName, businessOwner,
                        BusinessesCategoriesDatumId: businessCategory,
                        state: businessState,
                        businessType: pricingType,
                        localGovernment: businessLGA, address: businessAddress, staffCount, openingTime,
                        closingTime, phoneNumber, emailAddress: companyEmail, website: companyWebsite,
                        monday: monday.timeRange, tuesday: tuesday.timeRange, wednesday: wednesday.timeRange,
                        thursday: thursday.timeRange, friday: friday.timeRange, saturday: saturday.timeRange, sunday: sunday.timeRange,
                        businessDescription: bodyText,
                        businessFacebook: req.body.e.communityFacebook,
                        businessInstagram: req.body.e.communityInstagram,
                        businessTwitter: req.body.e.communityTwitter,
                        AmbassadorId: req.body.ambassadorId
                    })
                        .then(newEventCreated => {
                            let questionBank = [];
                            for (let questionData of Object.keys(req.body.e)) {
                                if (questionData.indexOf('faqs') !== -1) {
                                    questionBank.push(req.body.e[questionData]);
                                    // console.log(questionData)
                                }
                            }
                            for (let question of questionBank) {
                                let faqBox = [];
                                if (question.question && question.answers) {
                                    let bulkFAQs = {
                                        questions: question.question,
                                        answers: question.answers,
                                        BusinessRecordId: newEventCreated.id
                                    };
                                    faqBox.push(bulkFAQs);
                                }
                                BusinessFAQs.bulkCreate(faqBox)
                                    .then(updated => {
                                        console.log('done')
                                    })
                                    .catch(err => console.log(err))
                            }
                            for (let questionData of Object.keys(req.body.e)) {
                                if (questionData.indexOf('pricingData') !== -1) {
                                    questionBank.push(req.body.e[questionData]);
                                    // console.log(questionData)
                                }
                            }
                            for (let question of questionBank) {
                                let pricingPlanBox = [];
                                if (question.planName) {
                                    let bulkPricingPlans = {
                                        productName: question.planName,
                                        BusinessRecordId: newEventCreated.id
                                    };
                                    pricingPlanBox.push(bulkPricingPlans);
                                }
                                BusinessOffering.bulkCreate(pricingPlanBox)
                                    .then(updated => {
                                        console.log('done')
                                    })
                                    .catch(err => console.log(err))
                            }

                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'New business created successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                });
            });
        })
    });
})

apiRouter.post('/newbusiness', (req, res) => {
    let { logo, businessName, number_of_staff, registrationNumber, number_of_times_opened_in_a_week,
        businessDescription, state, address, BusinessCategoryId,
        phoneNumber, whatsappNumber, type
    } = req.body;


    const url = './images' + Date.now();
    base64Img.img(logo, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${businessName}-big`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let secondImage = data.Location;
            BusinessRecords.create({
                businessName,
                logo: secondImage,
                businessDescription, address, state, BusinessCategoryId, pricing,
                registrationNumber, number_of_staff, number_of_times_opened_in_a_week,
                phoneNumber, whatsappNumber, type
            })
                .then(newBusinessCreated => {
                    if (products) {
                        BusinessRecordProducts.create({
                            name,
                            BusinessRecordsId: newBusinessCreated.id
                        })
                            .then(newBusinessProductsCreated => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'success',
                                    summary: 'New business created successfully',
                                    message: ''
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 200,
                                    statusMessage: 'error',
                                    summary: 'Data could not be saved',
                                    message: err
                                };
                                res.json(errorMessage);
                            })
                    } else {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'New business created successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    }
                })
                .catch(err => {
                    console.log(err)
                    let errorMessage = {
                        statusCode: 200,
                        statusMessage: 'error',
                        summary: 'Data could not be saved',
                        message: err
                    };
                    res.json(errorMessage);
                })
        });
    });
})

apiRouter.post('/newcommunity', (req, res) => {
    let { displayImage, coverImage, communityName, communityDescription, creator } = req.body;

    const url = './images' + Date.now();
    base64Img.img(displayImage, '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${communityName}-small`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            let firstImage = data.Location;
            const url = './images' + Date.now();
            base64Img.img(coverImage, '', url, function (err, filepath) {
                const fileContent = fs.readFileSync(filepath);
                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'afrikabucket',
                    Key: `${communityName}-big`, // File name you want to save as in S3
                    Body: fileContent,
                    ACL: 'public-read-write'
                };
                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let secondImage = data.Location;
                    CommunityRecords.create({
                        communityName,
                        displayImage: firstImage,
                        coverImage: secondImage,
                        communityDescription,
                        CommunityCategoryId,
                    })
                        .then(newCommunityCreated => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'success',
                                summary: 'New community created successfully',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'error',
                                summary: 'Data could not be saved',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                });
            });
        })
    });

    // const url = './images' + Date.now();
    // base64Img.img(logo, '', url, function (err, filepath) {
    //     const fileContent = fs.readFileSync(filepath);
    //     // Setting up S3 upload parameters
    //     const params = {
    //         Bucket: 'afrikabucket',
    //         Key: `${businessName}-big`, // File name you want to save as in S3
    //         Body: fileContent,
    //         ACL: 'public-read-write'
    //     };
    //     // Uploading files to the bucket
    //     s3.upload(params, function (err, data) {
    //         if (err) {
    //             throw err;
    //         }
    //         let secondImage = data.Location;
    //         BusinessRecords.create({
    //             businessName,
    //             logo: secondImage,
    //             businessDescription, address, state, BusinessCategoryId, pricing,
    //             registrationNumber, number_of_staff, number_of_times_opened_in_a_week,
    //             phoneNumber, whatsappNumber, type
    //         })
    //             .then(newBusinessCreated => {
    //                 if (products) {
    //                     BusinessRecordProducts.create({
    //                         name,
    //                         BusinessRecordsId: newBusinessCreated.id
    //                     })
    //                         .then(newBusinessProductsCreated => {
    //                             let successMessage = {
    //                                 statusCode: 200,
    //                                 statusMessage: 'success',
    //                                 summary: 'New business created successfully',
    //                                 message: ''
    //                             };
    //                             res.json(successMessage);
    //                         })
    //                         .catch(err => {
    //                             let errorMessage = {
    //                                 statusCode: 200,
    //                                 statusMessage: 'error',
    //                                 summary: 'Data could not be saved',
    //                                 message: err
    //                             };
    //                             res.json(errorMessage);
    //                         })
    //                 } else {
    //                     let successMessage = {
    //                         statusCode: 200,
    //                         statusMessage: 'success',
    //                         summary: 'New community created successfully',
    //                         message: ''
    //                     };
    //                     res.json(successMessage);
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log(err)
    //                 let errorMessage = {
    //                     statusCode: 200,
    //                     statusMessage: 'error',
    //                     summary: 'Data could not be saved',
    //                     message: err
    //                 };
    //                 res.json(errorMessage);
    //             })
    //     });
    // });
})

// Admin

adminRouter.post('/newEventTags', (req, res) => {
    EventCategoryTags.findOne({
        where: {
            tagName: req.body.tagName,
            EventCategoriesDatumId: req.body.categoryId
        }
    })
        .then(stateData => {
            if (stateData) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'Tag name already exists',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                EventCategoryTags.create({
                    tagName: req.body.tagName,
                    EventCategoriesDatumId: req.body.categoryId
                })
                    .then(stateCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'Tag created successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'Tag could not be created',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be created',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/newCommunityTags', (req, res) => {
    CommunityCategoryTags.findOne({
        where: {
            tagName: req.body.tagName,
            CommunityCategoriesDatumId: req.body.categoryId
        }
    })
        .then(stateData => {
            if (stateData) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'Tag name already exists',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                CommunityCategoryTags.create({
                    tagName: req.body.tagName,
                    CommunityCategoriesDatumId: req.body.categoryId
                })
                    .then(stateCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'Tag created successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'Tag could not be created',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be created',
                message: ''
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/newBusinessTags', (req, res) => {
    BusinessCategoryTags.findOne({
        where: {
            tagName: req.body.tagName,
            BusinessesCategoriesDatumId: req.body.categoryId
        }
    })
        .then(stateData => {
            if (stateData) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'Tag name already exists',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                BusinessCategoryTags.create({
                    tagName: req.body.tagName,
                    BusinessesCategoriesDatumId: req.body.categoryId
                })
                    .then(stateCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'Tag created successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'Tag could not be created',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be created',
                message: ''
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/newstate', (req, res) => {
    State.findOne({
        where: {
            name: req.body.stateName
        }
    })
        .then(stateData => {
            if (stateData) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'State name already exists',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                State.create({
                    name: req.body.stateName
                })
                    .then(stateCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'State created successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'State could not be created',
                            summary: 'failure',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'State could not be created',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/allstates', (req, res) => {
    State.findAll({
        include: [{
            model: EventsRecords
        }, {
            model: CommunityRecords
        }, {
            model: BusinessRecords
        }, {
            model: LocalGovernment
        }]
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'States fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'State could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/alleventtags', (req, res) => {
    EventCategoryTags.findAll({
        include: [{
            model: EventCategoriesData
        }]
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Tags fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tags could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/allcommunitytags', (req, res) => {
    CommunityCategoryTags.findAll({
        include: [{
            model: CommunityCategoriesData
        }]
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Tags fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tags could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/allbusinesstags', (req, res) => {
    BusinessCategoryTags.findAll({
        include: [{
            model: BusinessesCategoriesData
        }]
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Tags fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tags could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteeventtag', checkAdmin, (req, res) => {
    EventCategoryTags.destroy({
        where: {
            id: req.body.tagId
        }
    })
        .then(eventDeleted => {
            EventCategoryTags.findAll({
                include: [{
                    model: EventCategoriesData
                }]
            })
                .then(stateData => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Tags fetched successfully',
                        message: stateData
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'Tags could not be fetched',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be deleted',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deletecommunitytag', checkAdmin, (req, res) => {
    CommunityCategoryTags.destroy({
        where: {
            id: req.body.tagId
        }
    })
        .then(eventDeleted => {
            CommunityCategoryTags.findAll({
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(stateData => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Tags fetched successfully',
                        message: stateData
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'Tags could not be fetched',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be deleted',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deletebusinesstag', checkAdmin, (req, res) => {
    BusinessCategoryTags.destroy({
        where: {
            id: req.body.tagId
        }
    })
        .then(eventDeleted => {
            BusinessCategoryTags.findAll({
                include: [{
                    model: BusinessesCategoriesData
                }]
            })
                .then(stateData => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Tags fetched successfully',
                        message: stateData
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'Tags could not be fetched',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'Tag could not be deleted',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/state/:stateId', (req, res) => {
    State.findOne({
        where: {
            id: req.params.stateId
        },
        include: [{
            model: EventsRecords
        }, {
            model: CommunityRecords
        }, {
            model: BusinessRecords
        }, {
            model: LocalGovernment
        }]
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'States fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'State could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/deleteLG', (req, res) => {
    LocalGovernment.destroy({
        where: {
            id: req.body.lgId
        }
    })
        .then(lgData => {
            State.findOne({
                where: {
                    id: req.body.stateId
                },
                include: [{
                    model: EventsRecords
                }, {
                    model: CommunityRecords
                }, {
                    model: BusinessRecords
                }, {
                    model: LocalGovernment
                }]
            })
                .then(stateData => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'States fetched successfully',
                        summary: 'success',
                        message: stateData
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while deleting local government',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting local government',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/lg/:lgId', (req, res) => {
    LocalGovernment.findOne({
        where: {
            id: req.params.lgId
        }
    })
        .then(lgData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'States fetched successfully',
                summary: 'success',
                message: lgData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting local government',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/updatelg', (req, res) => {

    LocalGovernment.update({
        name: req.body.lgName,
        StateId: req.body.StateId
    }, {
        where: {
            id: req.body.lgaID
        }
    })
        .then(stateCreated => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Local government updated successfully',
                summary: 'success',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'Local government could not be updated',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/getallstates/:stateId', (req, res) => {
    State.findAll({
        where: {
            id: req.params.stateId
        }
    })
        .then(stateData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'States fetched successfully',
                summary: 'success',
                message: stateData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'State could not be fetched',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/updatestate', (req, res) => {
    // State.findOne({
    //     where: {
    //         name: req.body.stateName
    //     }
    // })
    //     .then(stateData => {
    //         if (stateData) {
    //             let errorMessage = {
    //                 statusCode: 400,
    //                 statusMessage: 'State name already exists',
    //                 summary: 'failure',
    //                 message: ''
    //             };
    //             res.json(errorMessage);
    //         } else {
    State.update({
        name: req.body.stateName
    }, {
        where: {
            id: req.body.stateId
        }
    })
        .then(stateCreated => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'State updated successfully',
                summary: 'success',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'State could not be updated',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
    // }
    // })
    // .catch(err => {
    //     let errorMessage = {
    //         statusCode: 400,
    //         statusMessage: 'failure',
    //         summary: 'State could not be updated',
    //         message: ''
    //     };
    //     res.json(errorMessage);
    // })
})

adminRouter.post('/deleteState', (req, res) => {
    State.destroy({
        where: {
            id: req.body.stateId
        }
    })
        .then(lgData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'States deleted successfully',
                summary: 'success',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting state',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/newlg', (req, res) => {
    LocalGovernment.findOne({
        where: {
            name: req.body.lgName,
            StateId: req.body.StateId
        }
    })
        .then(stateData => {
            if (stateData) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Local government already exists under this state',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                LocalGovernment.create({
                    name: req.body.lgName,
                    StateId: req.body.StateId
                })
                    .then(stateCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Local government added successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'Local government could not be added',
                            summary: 'failure',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'Local government could not be added',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

// admin business

adminRouter.post('/createBusinessesCategory', (req, res) => {
    BusinessesCategoriesData.findOne({
        where: {
            categoryName: req.body.categoryName
        }
    })
        .then(categoryData => {
            if (categoryData) {
                let errorMessage = {
                    statusCode: 408,
                    statusMessage: 'Category name already exists in database',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                const url = './images' + Date.now();
                base64Img.img(req.body.categoryImage, '', url, function (err, filepath) {
                    const fileContent = fs.readFileSync(filepath);
                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'afrikabucket',
                        Key: `${req.body.categoryName}`, // File name you want to save as in S3
                        Body: fileContent,
                        ACL: 'public-read-write'
                    };

                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        let imageURL = data.Location;
                        BusinessesCategoriesData.create({
                            categoryImage: imageURL,
                            categoryName: req.body.categoryName
                        })
                            .then(categoryCreated => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Category created successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'An error occurred while creating category',
                                    summary: 'failure',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while creating category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideBusiness', (req, res) => {
    BusinessRecords.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.businessId
        }
    })
        .then(allEvents => {
            BusinessRecords.findAll({
                include: [{
                    model: BusinessesCategoriesData
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community updated successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating community',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showBusiness', (req, res) => {
    BusinessRecords.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.businessId
        }
    })
        .then(allEvents => {
            BusinessRecords.findAll({
                include: [{
                    model: BusinessesCategoriesData
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community updated successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating community',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_businesses', (req, res) => {
    BusinessRecords.findAll({
        include: [{
            model: BusinessesCategoriesData
        }, {
            model: businessReviews
        }]
    })
        .then(allBusinesses => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Businesses fetched successfully',
                message: allBusinesses
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching businesses',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_visible_businesses', (req, res) => {
    BusinessRecords.findAll({
        include: [{
            model: BusinessesCategoriesData
        }],
        where: {
            displayStatus: true
        }
    })
        .then(allBusinesses => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Businesses fetched successfully',
                summary: 'success',
                message: allBusinesses
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching businesses',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_hidden_businesses', (req, res) => {
    BusinessRecords.findAll({
        include: [{
            model: BusinessesCategoriesData
        }],
        where: {
            displayStatus: false
        }
    })
        .then(allBusinesses => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Businesses fetched successfully',
                summary: 'success',
                message: allBusinesses
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching businesses',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideBusinessCategories', (req, res) => {
    BusinessesCategoriesData.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.businessCategoryId
        }
    })
        .then(() => {
            BusinessesCategoriesData.findAll({
                include: [{
                    model: BusinessRecords
                }]
            })
                .then(allBusinesses => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Business categories updated successfully',
                        summary: 'success',
                        message: allBusinesses
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating businesses categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showBusinessCategories', (req, res) => {
    BusinessesCategoriesData.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.businessCategoryId
        }
    })
        .then(() => {
            BusinessesCategoriesData.findAll({
                include: [{
                    model: BusinessRecords
                }]
            })
                .then(allBusinesses => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Business categories updated successfully',
                        summary: 'success',
                        message: allBusinesses
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating businesses categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

// admin community

adminRouter.post('/createCommunitiesCategory', (req, res) => {
    CommunityCategoriesData.findOne({
        where: {
            categoryName: req.body.categoryName
        }
    })
        .then(categoryData => {
            if (categoryData) {
                let errorMessage = {
                    statusCode: 408,
                    statusMessage: 'Category name already exists in database',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                const url = './images' + Date.now();
                base64Img.img(req.body.categoryImage, '', url, function (err, filepath) {
                    const fileContent = fs.readFileSync(filepath);
                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'afrikabucket',
                        Key: `${req.body.categoryName}`, // File name you want to save as in S3
                        Body: fileContent,
                        ACL: 'public-read-write'
                    };

                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        let imageURL = data.Location;
                        CommunityCategoriesData.create({
                            categoryImage: imageURL,
                            categoryName: req.body.categoryName
                        })
                            .then(categoryCreated => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Category created successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'An error occurred while creating category',
                                    summary: 'failure',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while creating category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/createCommunitiesCategory', (req, res) => {
    CommunityCategoriesData.findOne({
        where: {
            categoryName: req.body.categoryName
        }
    })
        .then(categoryData => {
            if (categoryData) {
                let errorMessage = {
                    statusCode: 408,
                    statusMessage: 'Category name already exists in database',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                const url = './images' + Date.now();
                base64Img.img(req.body.categoryImage, '', url, function (err, filepath) {
                    const fileContent = fs.readFileSync(filepath);
                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'afrikabucket',
                        Key: `${req.body.categoryName}`, // File name you want to save as in S3
                        Body: fileContent,
                        ACL: 'public-read-write'
                    };

                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        let imageURL = data.Location;
                        CommunityCategoriesData.create({
                            categoryImage: imageURL,
                            categoryName: req.body.categoryName
                        })
                            .then(categoryCreated => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Category created successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'An error occurred while creating category',
                                    summary: 'failure',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while creating category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideCommunity', (req, res) => {
    CommunityRecords.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.communityId
        }
    })
        .then(allEvents => {
            CommunityRecords.findAll({
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community updated successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating community',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showCommunity', (req, res) => {
    CommunityRecords.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.communityId
        }
    })
        .then(allEvents => {
            CommunityRecords.findAll({
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community updated successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating community',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_communities', (req, res) => {
    CommunityRecords.findAll({
        include: [{
            model: CommunityCategoriesData
        }, {
            model: communityReviews
        }]
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Communities fetched successfully',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching communities',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_visible_communities', (req, res) => {
    CommunityRecords.findAll({
        include: [{
            model: CommunityCategoriesData
        }],
        where: {
            displayStatus: true
        }
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities fetched successfully',
                summary: 'success',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_hidden_communities', (req, res) => {
    CommunityRecords.findAll({
        include: [{
            model: CommunityCategoriesData
        }],
        where: {
            displayStatus: false
        }
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities fetched successfully',
                summary: 'success',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideCommunityCategories', (req, res) => {
    CommunityCategoriesData.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.communityCategoryId
        }
    })
        .then(() => {
            CommunityCategoriesData.findAll({
                include: [{
                    model: CommunityRecords
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community categories updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showCommunityCategories', (req, res) => {
    CommunityCategoriesData.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.communityCategoryId
        }
    })
        .then(() => {
            CommunityCategoriesData.findAll({
                include: [{
                    model: CommunityRecords
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Community categories updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating community categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_communities_categories', (req, res) => {
    CommunityCategoriesData.findAll({
        include: [{
            model: CommunityRecords
        }]
    })
        .then(allCommunitiesCategories => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Communities categories fetched successfully',
                message: allCommunitiesCategories
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching communities categories',
                message: ''
            };
            res.json(errorMessage);
        })
})

// admin event
adminRouter.post('/check_administrator_email', (req, res) => {
    try {
        let extractedEmail = jwt.verify(req.body.userCode, '123456789poituuyets');
        NewAdministrator.findOne({
            where: {
                emailAddress: extractedEmail.emailAddress
            }
        })
            .then(ambassadorData => {
                if (ambassadorData) {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Ambassadors data found',
                        summary: 'success',
                        message: ambassadorData
                    };
                    res.json(successMessage);
                } else {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'Ambassador data could not be found',
                        summary: 'error',
                        message: ''
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Ambassador data could not be found',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            })
    } catch (err) {
        let errorMessage = {
            statusCode: 400,
            statusMessage: 'Token is expired. Please contact administrator to continue',
            summary: 'error',
            message: ''
        };
        res.json(errorMessage);
    }
})

adminRouter.post('/set_administrator_password', async (req, res) => {
    try {
        let extractedEmail = jwt.verify(req.body.userCode, '123456789poituuyets');
        let scrypt = util.promisify(crypto.scrypt);
        let salt = crypto.randomBytes(16).toString('hex');
        let newPassword = await scrypt(req.body.password, salt, 64);
        let password = newPassword.toString('hex');
        NewAdministrator.findOne({
            where: {
                emailAddress: extractedEmail.emailAddress
            }
        })
            .then(ambassadorData => {
                if (ambassadorData) {
                    Administrator.create({
                        firstName: ambassadorData.firstName,
                        lastName: ambassadorData.lastName,
                        emailAddress: ambassadorData.emailAddress,
                        phoneNumber: ambassadorData.phoneNumber,
                        password: `${password}.${salt}`,
                    })
                        .then(newAmbassadorData => {
                            NewAdministrator.destroy({
                                where: {
                                    id: ambassadorData.id
                                }
                            })
                                .then(userData => {

                                    Ambassadors.create({
                                        firstName: ambassadorData.firstName,
                                        lastName: ambassadorData.lastName,
                                        emailAddress: ambassadorData.emailAddress,
                                        phoneNumber: ambassadorData.phoneNumber,
                                        password: `${password}.${salt}`,
                                        AdministratorId: newAmbassadorData.id
                                    })
                                        .then(profileDone => {
                                            let successMessage = {
                                                statusCode: 200,
                                                statusMessage: 'Administrators data created',
                                                summary: 'success',
                                                message: newAmbassadorData
                                            };
                                            res.json(successMessage);
                                        })
                                        .catch(err => {
                                            let errorMessage = {
                                                statusCode: 400,
                                                statusMessage: 'Administrator data could not be created',
                                                summary: 'error',
                                                message: ''
                                            };
                                            res.json(errorMessage);
                                        })
                                })
                                .catch(err => {
                                    let errorMessage = {
                                        statusCode: 400,
                                        statusMessage: 'Administrator data could not be updated',
                                        summary: 'error',
                                        message: ''
                                    };
                                    res.json(errorMessage);
                                })
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'Administrator data could not be updated. Please try again.',
                                summary: 'error',
                                message: ''
                            };
                            res.json(errorMessage);
                        })
                } else {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'Administrator data could not be found',
                        summary: 'error',
                        message: ''
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Administrator data could not be updated. Please try again.',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            })
    } catch (err) {
        let errorMessage = {
            statusCode: 400,
            statusMessage: 'Token is expired. Please contact administrator to continue',
            summary: 'error',
            message: ''
        };
        res.json(errorMessage);
    }
})

adminRouter.post('/newadministrator', (req, res) => {
    Administrator.findOne({
        where: {
            emailAddress: req.body.emailAddress
        }
    })
        .then(ambassadorFound => {
            if (ambassadorFound) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Administrator email already exists',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                // const transporter = nodemailer.createTransport({
                //     host: 'server106.web-hosting.com',
                //     port: 465,
                //     secure: true,
                //     transportMethod: 'SMTP',
                //     auth: {
                //         user: 'info@thisisalsoafrica.com',
                //         pass: 'Highziknewthing1992#'
                //     }
                // });
                const transporter = nodemailer.createTransport({
                    port: 25,
                    host: 'localhost',
                    tls: {
                        rejectUnauthorized: false
                    },
                });

                let ambassadorCode = jwt.sign({ emailAddress: req.body.emailAddress }, '123456789poituuyets', {
                    expiresIn: '3min'
                });

                let ambassadorURL = `http://localhost:3000/set_password/${ambassadorCode}`;

                var mailOptions = {
                    from: 'noreply@domain.com',
                    to: 'whatever@otherdomain.com',
                    subject: 'Confirm Email',
                    text: 'Please confirm your email',
                    html: '<p>Please confirm your email</p>'
                };

                NewAdministrator.destroy({
                    where: {
                        emailAddress: req.body.emailAddress
                    }
                })
                    .then(ambassadorData => {
                        NewAdministrator.create({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            emailAddress: req.body.emailAddress,
                            phoneNumber: req.body.phoneNumber,
                        })
                            .then(signupComplete => {
                                // transporter.sendMail(mailOptions, function (error, info) {
                                // if (error) {
                                //     console.log(error);
                                //     let errorMessage = {
                                //         statusCode: 400,
                                //         status: 'error',
                                //         summary: 'Ambassador could not be added',
                                //         message: {}
                                //     }
                                //     res.json(errorMessage);
                                // } else {
                                console.log(ambassadorURL);
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Administrator saved successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                                // }
                                // });
                            })
                            .catch(err => {
                                console.log(err);
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'failure',
                                    summary: 'User could not be saved',
                                    message: err
                                };
                                res.json(errorMessage);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to sign you up. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to sign you up. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_administrators', (req, res) => {
    Administrator.findAll({
        include: [{
            model: Ambassadors,
            include: [{
                model: EventsRecords
            }, {
                model: CommunityRecords
            }, {
                model: BusinessRecords
            }]
        }]
    })
        .then(allAmbassadors => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Ambassadors fetched successfully',
                summary: 'success',
                message: allAmbassadors
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching ambassadors',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_users', checkAdmin, (req, res) => {
    Users.findAll({
        include: [{
            model: eventReviews
        }, {
            model: communityReviews
        }, {
            model: businessReviews
        }]
    })
        .then(allAmbassadors => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Users fetched successfully',
                summary: 'success',
                message: allAmbassadors
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching users',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allevents/:eventId', (req, res) => {
    EventsRecords.findOne({
        where: {
            id: req.params.eventId
        },
        include: [{
            model: EventCategoriesData
        }, {
            model: EventPricingPlans
        }, {
            model: EventsFAQs
        }]
    })
        .then(eventData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Event fetched successfully',
                summary: 'success',
                message: eventData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allbusinesses/:businessId', (req, res) => {
    BusinessRecords.findOne({
        where: {
            id: req.params.businessId
        },
        include: [{
            model: BusinessesCategoriesData
        }, {
            model: BusinessFAQs
        }]
    })
        .then(eventData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Business fetched successfully',
                summary: 'success',
                message: eventData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching business',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/allcommunities/:communityId', (req, res) => {
    CommunityRecords.findOne({
        where: {
            id: req.params.communityId
        },
        include: [{
            model: CommunityCategoriesData
        }, {
            model: CommunityFAQs
        }]
    })
        .then(eventData => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Community fetched successfully',
                message: eventData
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching community',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/event/:eventId', (req, res) => {
    EventsRecords.findOne({
        where: {
            id: req.params.eventId
        },
        include: [{
            model: EventCategoriesData
        }, {
            model: EventPricingPlans
        }, {
            model: EventsFAQs
        }]
    })
        .then(async eventData => {


            let response = await axios(eventData.mainImage);
            let data = await response.arrayBuffer();
            let metadata = {
                type: 'image/jpeg'
            };
            let file = new File([data], "test.jpg", metadata);
            // ... do something with the file or return it
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                // console.log('DataURL:', e.target.result);
                let successMessage = {
                    statusCode: 200,
                    statusMessage: 'Event fetched successfully',
                    summary: 'success',
                    message: e.target.result
                };
                res.json(successMessage);
            };

            // let successMessage = {
            //     statusCode: 200,
            //     statusMessage: 'Event fetched successfully',
            //     summary: 'success',
            //     message: eventData
            // };
            // res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/createEventsCategory', (req, res) => {
    EventCategoriesData.findOne({
        where: {
            categoryName: req.body.categoryName
        }
    })
        .then(categoryData => {
            if (categoryData) {
                let errorMessage = {
                    statusCode: 408,
                    statusMessage: 'Category name already exists in database',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                const url = './images' + Date.now();
                base64Img.img(req.body.categoryImage, '', url, function (err, filepath) {
                    const fileContent = fs.readFileSync(filepath);
                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'afrikabucket',
                        Key: `${req.body.categoryName}`, // File name you want to save as in S3
                        Body: fileContent,
                        ACL: 'public-read-write'
                    };

                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        if (err) {
                            throw err;
                        }
                        let imageURL = data.Location;
                        EventCategoriesData.create({
                            categoryImage: imageURL,
                            categoryName: req.body.categoryName
                        })
                            .then(categoryCreated => {
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Category created successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                            })
                            .catch(err => {
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'An error occurred while creating category',
                                    summary: 'failure',
                                    message: ''
                                };
                                res.json(errorMessage);
                            })
                    })
                })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while creating category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/createEventsSubCategory', checkAdmin, (req, res) => {
    EventSubCategories.findOne({
        where: {
            subcategoryName: req.body.subcategoryName,
            CategoryId: req.body.categoryId
        }
    })
        .then(categoryData => {
            if (categoryData) {
                let errorMessage = {
                    statusCode: 408,
                    statusMessage: 'failure',
                    summary: 'Sub-Category name already exists in this category',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                EventSubCategories.create({
                    subcategoryName: req.body.name,
                    CategoryId: req.body.categoryId
                })
                    .then(categoryCreated => {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'Sub-Category created successfully',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while creating sub-category',
                            message: ''
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while creating sub-category',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteEvent', checkAdmin, (req, res) => {
    EventsRecords.destroy({
        where: {
            id: req.body.eventId
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Event deleted successfully',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting event',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideEvent', (req, res) => {
    EventsRecords.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.eventId
        }
    })
        .then(allEvents => {
            EventsRecords.findAll({
                include: [{
                    model: EventCategoriesData
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Event updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating event',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating event',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showEvent', (req, res) => {
    EventsRecords.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.eventId
        }
    })
        .then(allEvents => {
            EventsRecords.findAll({
                include: [{
                    model: EventCategoriesData
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Event updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating event',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating event',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideEventCategories', (req, res) => {
    EventCategoriesData.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.eventCategoryId
        }
    })
        .then(() => {
            EventCategoriesData.findAll({
                include: [{
                    model: EventsRecords
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Event categories updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating events categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showEventCategories', (req, res) => {
    EventCategoriesData.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.eventCategoryId
        }
    })
        .then(() => {
            EventCategoriesData.findAll({
                include: [{
                    model: EventsRecords
                }]
            })
                .then(allEvents => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Event categories updated successfully',
                        summary: 'success',
                        message: allEvents
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating events categories',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while updating Category',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hideEventSubCategories', checkAdmin, (req, res) => {
    EventSubCategories.update({
        displayStatus: false
    }, {
        where: {
            id: req.body.eventSubCategoryId
        }
    })
        .then(() => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Sub-Category updated successfully',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating Sub-Category',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/showEventSubCategories', checkAdmin, (req, res) => {
    EventSubCategories.update({
        displayStatus: true
    }, {
        where: {
            id: req.body.eventSubCategoryId
        }
    })
        .then(() => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Sub-Category updated successfully',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating Sub-Category',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_data', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }]
    })
        .then(eventsData => {
            CommunityRecords.findAll({
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(communitiesData => {
                    BusinessRecords.findAll({
                        include: [{
                            model: BusinessesCategoriesData
                        }]
                    })
                        .then(businessData => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Data fetched successfully',
                                summary: 'success',
                                message: {
                                    eventsData,
                                    communitiesData,
                                    businessData
                                }
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'failure',
                                summary: 'An error occurred while trying to fetch data. Please try again.',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to fetch data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_events', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData,
        }, {
            model: eventReviews
        }, {
            model: EventPricingPlans
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_visible_events', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }],
        where: {
            displayStatus: true
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_hidden_events', (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }],
        where: {
            displayStatus: false
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_event_categories', (req, res) => {
    EventCategoriesData.findAll({
        include: [{
            model: EventsRecords
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_community_categories', (req, res) => {
    CommunityCategoriesData.findAll({
        include: [{
            model: CommunityRecords
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching community categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/get_all_business_categories', (req, res) => {
    BusinessesCategoriesData.findAll({
        include: [{
            model: BusinessRecords
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Business categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching business categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/upload_new_events', (req, res) => {
    const url = './images' + Date.now();
    base64Img.img(req.body.eventTitle + '_small', '', url, function (err, filepath) {
        const fileContent = fs.readFileSync(filepath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'afrikabucket',
            Key: `${req.body.eventTitle}_small`, // File name you want to save as in S3
            Body: fileContent,
            ACL: 'public-read-write'
        };

        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }

            let imageURL = data.Location;
            base64Img.img(req.body.eventTitle + '_big', '', url, function (err, filepath) {
                const fileContent = fs.readFileSync(filepath);
                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'afrikabucket',
                    Key: `${req.body.eventTitle}_small`, // File name you want to save as in S3
                    Body: fileContent,
                    ACL: 'public-read-write'
                };

                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let mainImageURL = data.Location;

                    EventCategories.create({
                        categoryImage: imageURL,
                        categoryName: req.body.categoryName
                    })
                        .then(categoryCreated => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Category created successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'An error occurred while creating category',
                                summary: 'failure',
                                message: ''
                            };
                            res.json(errorMessage);
                        })
                })
            })
        })
    })
})

adminRouter.post('/editEventBasicInfo', (req, res) => {
    let { displayImageUpdated, mainImageUpdated, imageUrl: displayImage, mainImageUrl: mainImage,
        eventTitle, eventOrganizer, eventCategory,
        eventType, eventState, eventLGA, eventAddress, eventURL, eventStarts, startTime,
        eventEnds, endTime } = req.body;


    EventsRecords.findOne({
        where: {
            id: req.body.eventsId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                //upload new
                if (displayImageUpdated && mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${eventTitle}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            let secondImage = '';
                            const mainImageURL = './images' + Date.now();
                            base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                                const fileContent = fs.readFileSync(filepath);
                                // Setting up S3 upload parameters
                                const params = {
                                    Bucket: 'afrikabucket',
                                    Key: `${eventTitle}_${new Date()}-big`, // File name you want to save as in S3
                                    Body: fileContent,
                                    ACL: 'public-read-write'
                                };
                                // Uploading files to the bucket
                                s3.upload(params, function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                    secondImage = data.Location;
                                    EventsRecords.update({
                                        displayImage: firstImage,
                                        mainImage: secondImage,
                                        eventTitle, eventOrganizer,
                                        EventCategoriesDatumId: eventCategory,
                                        type: eventType, state: eventState,
                                        localGovernment: eventLGA, address: eventAddress, eventURL, eventStarts, startTime,
                                        eventEnds, endTime
                                    }, {
                                        where: {
                                            id: req.body.eventsId
                                        }
                                    })
                                        .then(newEventCreated => {
                                            //delete images on aws
                                            // check this delete code later
                                            // if (displayImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.displayImage
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            // if (mainImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.eventTitle
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            let successMessage = {
                                                statusCode: 200,
                                                statusMessage: 'New event created successfully',
                                                summary: 'success',
                                                message: ''
                                            };
                                            res.json(successMessage);
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            let errorMessage = {
                                                statusCode: 200,
                                                statusMessage: 'Data could not be saved',
                                                summary: 'error',
                                                message: err
                                            };
                                            res.json(errorMessage);
                                        })
                                });
                            });
                        })
                    });
                } else if (displayImageUpdated && !mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${eventTitle}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            EventsRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                eventTitle, eventOrganizer,
                                EventCategoriesDatumId: eventCategory,
                                type: eventType, state: eventState,
                                localGovernment: eventLGA, address: eventAddress, eventURL, eventStarts, startTime,
                                eventEnds, endTime
                            }, {
                                where: {
                                    id: req.body.eventsId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.eventTitle
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'New event created successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        })
                    });
                } else if (!displayImageUpdated && mainImageUpdated) {
                    let secondImage = '';
                    const mainImageURL = './images' + Date.now();
                    base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${eventTitle}_${new Date()}-big`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            secondImage = data.Location;
                            EventsRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                eventTitle, eventOrganizer,
                                EventCategoriesDatumId: eventCategory,
                                type: eventType, state: eventState,
                                localGovernment: eventLGA, address: eventAddress, eventURL, eventStarts, startTime,
                                eventEnds, endTime
                            }, {
                                where: {
                                    id: req.body.eventsId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.eventTitle
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'New event created successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        });
                    });
                } else {
                    EventsRecords.update({
                        displayImage: displayImageUpdated ? firstImage : displayImage,
                        mainImage: mainImageUpdated ? secondImage : mainImage,
                        eventTitle, eventOrganizer,
                        EventCategoriesDatumId: eventCategory,
                        type: eventType, state: eventState,
                        localGovernment: eventLGA, address: eventAddress, eventURL, eventStarts, startTime,
                        eventEnds, endTime
                    }, {
                        where: {
                            id: req.body.eventsId
                        }
                    })
                        .then(newEventCreated => {
                            //delete images on aws
                            // check this delete code later
                            // if (displayImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.displayImage
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            // if (mainImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.eventTitle
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'New event created successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                }
            } else {
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Data could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Data could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/editBusinessBasicInfo', (req, res) => {
    let { displayImageUpdated, mainImageUpdated, imageUrl: displayImage, mainImageUrl: mainImage,
        businessName, businessOwner, businessCategory, businessState, businessLGA, businessAddress, staffCount,
        phoneNumber, openingTime, closingTime, companyEmail, companyWebsite, businessInstagram, businessTwitter, businessFacebook } = req.body;

    BusinessRecords.findOne({
        where: {
            id: req.body.businessId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                //upload new
                if (displayImageUpdated && mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${businessName}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            let secondImage = '';
                            const mainImageURL = './images' + Date.now();
                            base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                                const fileContent = fs.readFileSync(filepath);
                                // Setting up S3 upload parameters
                                const params = {
                                    Bucket: 'afrikabucket',
                                    Key: `${businessName}_${new Date()}-big`, // File name you want to save as in S3
                                    Body: fileContent,
                                    ACL: 'public-read-write'
                                };
                                // Uploading files to the bucket
                                s3.upload(params, function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                    secondImage = data.Location;
                                    BusinessRecords.update({
                                        displayImage: firstImage,
                                        mainImage: secondImage,
                                        businessName, businessOwner,
                                        BusinessesCategoriesDatumId: businessCategory,
                                        state: businessState, staffCount,
                                        localGovernment: businessLGA, address: businessAddress, openingTime,
                                        closingTime, phoneNumber, emailAddress: companyEmail, website: companyWebsite, businessInstagram,
                                        businessTwitter, businessFacebook
                                    }, {
                                        where: {
                                            id: req.body.businessId
                                        }
                                    })
                                        .then(newEventCreated => {
                                            //delete images on aws
                                            // check this delete code later
                                            // if (displayImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.displayImage
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            // if (mainImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.businessName
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            let successMessage = {
                                                statusCode: 200,
                                                statusMessage: 'New event created successfully',
                                                summary: 'success',
                                                message: ''
                                            };
                                            res.json(successMessage);
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            let errorMessage = {
                                                statusCode: 200,
                                                statusMessage: 'Data could not be saved',
                                                summary: 'error',
                                                message: err
                                            };
                                            res.json(errorMessage);
                                        })
                                });
                            });
                        })
                    });
                } else if (displayImageUpdated && !mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${businessName}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            BusinessRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                businessName, businessOwner,
                                BusinessesCategoriesDatumId: businessCategory,
                                state: businessState, staffCount,
                                localGovernment: businessLGA, address: businessAddress, openingTime,
                                closingTime, phoneNumber, emailAddress: companyEmail, website: companyWebsite, businessInstagram,
                                businessTwitter, businessFacebook
                            }, {
                                where: {
                                    id: req.body.businessId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.businessName
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Business updated successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        })
                    });
                } else if (!displayImageUpdated && mainImageUpdated) {
                    let secondImage = '';
                    const mainImageURL = './images' + Date.now();
                    base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${businessName}_${new Date()}-big`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            secondImage = data.Location;
                            BusinessRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                businessName, businessOwner,
                                BusinessesCategoriesDatumId: businessCategory,
                                state: businessState, staffCount,
                                localGovernment: businessLGA, address: businessAddress, openingTime,
                                closingTime, phoneNumber, emailAddress: companyEmail, website: companyWebsite, businessInstagram,
                                businessTwitter, businessFacebook
                            }, {
                                where: {
                                    id: req.body.businessId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.businessName
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Business updated successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        });
                    });
                } else {
                    BusinessRecords.update({
                        displayImage: displayImageUpdated ? firstImage : displayImage,
                        mainImage: mainImageUpdated ? secondImage : mainImage,
                        businessName, businessOwner,
                        BusinessesCategoriesDatumId: businessCategory,
                        state: businessState, staffCount,
                        localGovernment: businessLGA, address: businessAddress, openingTime,
                        closingTime, phoneNumber, emailAddress: companyEmail, website: companyWebsite, businessInstagram,
                        businessTwitter, businessFacebook
                    }, {
                        where: {
                            id: req.body.businessId
                        }
                    })
                        .then(newEventCreated => {
                            //delete images on aws
                            // check this delete code later
                            // if (displayImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.displayImage
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            // if (mainImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.eventTitle
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Business updated successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                }
            } else {
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Data could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Data could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/editEventAccessibilityInfo', (req, res) => {

    let { bodyText, wheelchair, infant, transport, traveller, backProblems, pregnant,
        recommended, physicalFitness, infantSeat, pickup } = req.body;

    EventsRecords.findOne({
        where: {
            id: req.body.eventsId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                EventsRecords.update({
                    eventDescription: bodyText, wheelChair: wheelchair, infant, transport, traveller, backProblems, pregnant,
                    recommended, physicalFitness, infantSeat, pickup
                }, {
                    where: {
                        id: req.body.eventsId
                    }
                })
                    .then(newEventCreated => {
                        //delete images on aws
                        // check this delete code later
                        // if (displayImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.displayImage
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        // if (mainImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.eventTitle
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'New event created successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 200,
                            statusMessage: 'Data could not be saved',
                            summary: 'error',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                console.log(err)
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Data could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Data could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/editBusinessExtraInfo', (req, res) => {
    let { bodyText, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

    BusinessRecords.findOne({
        where: {
            id: req.body.businessId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                BusinessRecords.update({
                    monday: monday.timeRange, tuesday: tuesday.timeRange, wednesday: wednesday.timeRange,
                    thursday: thursday.timeRange, friday: friday.timeRange, saturday: saturday.timeRange, sunday: sunday.timeRange,
                    businessDescription: bodyText,
                    businessFacebook: req.body.e.communityFacebook,
                    businessInstagram: req.body.e.communityInstagram,
                    businessTwitter: req.body.e.communityTwitter,
                }, {
                    where: {
                        id: req.body.businessId
                    }
                })
                    .then(newEventCreated => {
                        //delete images on aws
                        // check this delete code later
                        // if (displayImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.displayImage
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        // if (mainImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.eventTitle
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Business updated successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 200,
                            statusMessage: 'Business could not be saved',
                            summary: 'error',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                console.log(err)
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Business could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Business could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/editCommunityBasicInfo', (req, res) => {
    let { displayImageUpdated, mainImageUpdated, imageUrl: displayImage, mainImageUrl: mainImage,
        CommunityTitle, CommunityOrganizer,
        communityCategory, CommunityState, CommunityLGA,
        CommunityAddress } = req.body;


    CommunityRecords.findOne({
        where: {
            id: req.body.communityId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                //upload new
                if (displayImageUpdated && mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${CommunityTitle}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            let secondImage = '';
                            const mainImageURL = './images' + Date.now();
                            base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                                const fileContent = fs.readFileSync(filepath);
                                // Setting up S3 upload parameters
                                const params = {
                                    Bucket: 'afrikabucket',
                                    Key: `${CommunityTitle}_${new Date()}-big`, // File name you want to save as in S3
                                    Body: fileContent,
                                    ACL: 'public-read-write'
                                };
                                // Uploading files to the bucket
                                s3.upload(params, function (err, data) {
                                    if (err) {
                                        throw err;
                                    }
                                    secondImage = data.Location;
                                    CommunityRecords.update({
                                        displayImage: firstImage,
                                        mainImage: secondImage,
                                        communityName: CommunityTitle, CommunityOrganizer,
                                        CommunityCategoriesDatumId: communityCategory,
                                        state: CommunityState,
                                        localGovernment: CommunityLGA, address: CommunityAddress
                                    }, {
                                        where: {
                                            id: req.body.communityId
                                        }
                                    })
                                        .then(newEventCreated => {
                                            //delete images on aws
                                            // check this delete code later
                                            // if (displayImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.displayImage
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            // if (mainImageUpdated) {
                                            //     s3.deleteObject({
                                            //         Bucket: 'afrikabucket',
                                            //         Key: prevEvent.CommunityTitle
                                            //     }, function (err, data) {
                                            //         if (err) throw err;
                                            //     })
                                            // }
                                            let successMessage = {
                                                statusCode: 200,
                                                statusMessage: 'Commmunity updated successfully',
                                                summary: 'success',
                                                message: ''
                                            };
                                            res.json(successMessage);
                                        })
                                        .catch(err => {
                                            console.log(err)
                                            let errorMessage = {
                                                statusCode: 200,
                                                statusMessage: 'Data could not be saved',
                                                summary: 'error',
                                                message: err
                                            };
                                            res.json(errorMessage);
                                        })
                                });
                            });
                        })
                    });
                } else if (displayImageUpdated && !mainImageUpdated) {
                    let firstImage = '';
                    let displayImageURL = './images' + Date.now();
                    base64Img.img(displayImage, '', displayImageURL, async function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${CommunityTitle}_${new Date()}-small`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            firstImage = data.Location;
                            CommunityRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                communityName: CommunityTitle, CommunityOrganizer,
                                CommunityCategoriesDatumId: communityCategory,
                                state: CommunityState,
                                localGovernment: CommunityLGA, address: CommunityAddress
                            }, {
                                where: {
                                    id: req.body.communityId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.CommunityTitle
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Community updated successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        })
                    });
                } else if (!displayImageUpdated && mainImageUpdated) {
                    let secondImage = '';
                    const mainImageURL = './images' + Date.now();
                    base64Img.img(mainImage, '', mainImageURL, function (err, filepath) {
                        const fileContent = fs.readFileSync(filepath);
                        // Setting up S3 upload parameters
                        const params = {
                            Bucket: 'afrikabucket',
                            Key: `${CommunityTitle}_${new Date()}-big`, // File name you want to save as in S3
                            Body: fileContent,
                            ACL: 'public-read-write'
                        };
                        // Uploading files to the bucket
                        s3.upload(params, function (err, data) {
                            if (err) {
                                throw err;
                            }
                            secondImage = data.Location;
                            CommunityRecords.update({
                                displayImage: displayImageUpdated ? firstImage : displayImage,
                                mainImage: mainImageUpdated ? secondImage : mainImage,
                                communityName: CommunityTitle, CommunityOrganizer,
                                CommunityCategoriesDatumId: communityCategory,
                                state: CommunityState,
                                localGovernment: CommunityLGA, address: CommunityAddress
                            }, {
                                where: {
                                    id: req.body.communityId
                                }
                            })
                                .then(newEventCreated => {
                                    //delete images on aws
                                    // check this delete code later
                                    // if (displayImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.displayImage
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    // if (mainImageUpdated) {
                                    //     s3.deleteObject({
                                    //         Bucket: 'afrikabucket',
                                    //         Key: prevEvent.CommunityTitle
                                    //     }, function (err, data) {
                                    //         if (err) throw err;
                                    //     })
                                    // }
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Community updated successfully',
                                        summary: 'success',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    console.log(err)
                                    let errorMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Data could not be saved',
                                        summary: 'error',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        });
                    });
                } else {
                    CommunityRecords.update({
                        displayImage: displayImageUpdated ? firstImage : displayImage,
                        mainImage: mainImageUpdated ? secondImage : mainImage,
                        communityName: CommunityTitle, CommunityOrganizer,
                        CommunityCategoriesDatumId: communityCategory,
                        state: CommunityState,
                        localGovernment: CommunityLGA, address: CommunityAddress
                    }, {
                        where: {
                            id: req.body.communityId
                        }
                    })
                        .then(newEventCreated => {
                            //delete images on aws
                            // check this delete code later
                            // if (displayImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.displayImage
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            // if (mainImageUpdated) {
                            //     s3.deleteObject({
                            //         Bucket: 'afrikabucket',
                            //         Key: prevEvent.eventTitle
                            //     }, function (err, data) {
                            //         if (err) throw err;
                            //     })
                            // }
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Community updated successfully',
                                summary: 'success',
                                message: ''
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            console.log(err)
                            let errorMessage = {
                                statusCode: 200,
                                statusMessage: 'Data could not be saved',
                                summary: 'error',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                }
            } else {
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Data could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Data could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/editCommunityAccessibilityInfo', (req, res) => {

    let { bodyText, wheelchair, infant, transport, traveller, backProblems, pregnant,
        recommended, physicalFitness, infantSeat, pickup, communityFacebook,
        communityInstagram, communityTwitter } = req.body;

    CommunityRecords.findOne({
        where: {
            id: req.body.communityId
        }
    })
        .then(async prevEvent => {
            if (prevEvent) {
                CommunityRecords.update({
                    communityDescription: bodyText, wheelChair: wheelchair, infant, transport, traveller, backProblems, pregnant,
                    recommended, physicalFitness, infantSeat, pickup, communityFacebook,
                    communityInstagram, communityTwitter
                }, {
                    where: {
                        id: req.body.communityId
                    }
                })
                    .then(newEventCreated => {
                        //delete images on aws
                        // check this delete code later
                        // if (displayImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.displayImage
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        // if (mainImageUpdated) {
                        //     s3.deleteObject({
                        //         Bucket: 'afrikabucket',
                        //         Key: prevEvent.eventTitle
                        //     }, function (err, data) {
                        //         if (err) throw err;
                        //     })
                        // }
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'Community updated successfully',
                            summary: 'success',
                            message: ''
                        };
                        res.json(successMessage);
                    })
                    .catch(err => {
                        console.log(err)
                        let errorMessage = {
                            statusCode: 200,
                            statusMessage: 'Data could not be saved',
                            summary: 'error',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            } else {
                console.log(err)
                let errorMessage = {
                    statusCode: 200,
                    statusMessage: 'Data could not be updated',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 200,
                statusMessage: 'Data could not be updated',
                summary: 'error',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/hello', (req, res) => {
    console.log(req.body)
})

adminRouter.get('/get_all_ambassadors', (req, res) => {
    Ambassadors.findAll({
        include: [{
            model: EventsRecords
        }, {
            model: CommunityRecords
        }, {
            model: BusinessRecords
        }]
    })
        .then(allAmbassadors => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Ambassadors fetched successfully',
                summary: 'success',
                message: allAmbassadors
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching ambassadors',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.get('/ambassador/:ambassadorId', (req, res) => {
    Ambassadors.findOne({
        where: {
            id: req.params.ambassadorId
        },
        include: [{
            model: EventsRecords
        }, {
            model: CommunityRecords
        }, {
            model: BusinessRecords
        }]
    })
        .then(allAmbassadors => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Ambassador data fetched successfully',
                summary: 'success',
                message: allAmbassadors
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching ambassador',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteambassador', (req, res) => {
    Ambassadors.destroy({
        where: {
            id: req.body.ambassadorID
        }
    })
        .then(signupComplete => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Ambassador deleted successfully',
                message: ''
            };
            res.json(successMessage);
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while deleting ambassador. Please try again',
                message: err
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/deauthorizeambassador', (req, res) => {
    Ambassadors.update({
        authorized: false
    }, {
        where: {
            id: req.body.ambassadorID
        }
    })
        .then(signupComplete => {
            Ambassadors.findOne({
                where: {
                    id: req.body.ambassadorID
                },
                include: [{
                    model: EventsRecords
                }, {
                    model: CommunityRecords
                }, {
                    model: BusinessRecords
                }]
            })
                .then(allAmbassadors => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Ambassador data updated successfully',
                        summary: 'success',
                        message: allAmbassadors
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating ambassador',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating ambassador. Please try again',
                message: err
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/authorizeambassador', (req, res) => {
    Ambassadors.update({
        authorized: true
    }, {
        where: {
            id: req.body.ambassadorID
        }
    })
        .then(signupComplete => {
            Ambassadors.findOne({
                where: {
                    id: req.body.ambassadorID
                },
                include: [{
                    model: EventsRecords
                }, {
                    model: CommunityRecords
                }, {
                    model: BusinessRecords
                }]
            })
                .then(allAmbassadors => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Ambassador data updated successfully',
                        summary: 'success',
                        message: allAmbassadors
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while updating ambassador',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while updating ambassador. Please try again',
                message: err
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteEventReview', checkAdmin, (req, res) => {
    eventReviews.destroy({
        where: {
            id: req.body.reviewId
        }
    })
        .then(allEvents => {
            eventReviews.findAll({
                where: {
                    EventsRecordId: req.body.eventId
                },
                include: [{
                    model: Users
                }],
                order: [[
                    'createdAt', 'DESC'
                ]]
            })
                .then(reviews => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Events reviews fetched successfully',
                        message: reviews
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while fetching events reviews',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events reviews',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteBusinessReview', checkAdmin, (req, res) => {
    businessReviews.destroy({
        where: {
            id: req.body.reviewId
        }
    })
        .then(allEvents => {
            businessReviews.findAll({
                where: {
                    BusinessRecordId: req.body.businessId
                },
                include: [{
                    model: Users
                }],
                order: [[
                    'createdAt', 'DESC'
                ]]
            })
                .then(reviews => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Business reviews fetched successfully',
                        message: reviews
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while fetching business reviews',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching business reviews',
                message: ''
            };
            res.json(errorMessage);
        })
})

adminRouter.post('/deleteCommunityReview', checkAdmin, (req, res) => {
    communityReviews.destroy({
        where: {
            id: req.body.reviewId
        }
    })
        .then(allEvents => {
            communityReviews.findAll({
                where: {
                    CommunityRecordId: req.body.communityId
                },
                include: [{
                    model: Users
                }],
                order: [[
                    'createdAt', 'DESC'
                ]]
            })
                .then(reviews => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'success',
                        summary: 'Community reviews fetched successfully',
                        message: reviews
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while fetching community reviews',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            console.log(err)
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching community reviews',
                message: ''
            };
            res.json(errorMessage);
        })
})


adminRouter.post('/signinadmin', (req, res) => {
    let { emailAddress, password } = req.body;
    Administrator.findOne({
        where: {
            emailAddress: emailAddress
        }
    })
        .then(async user => {
            if (user) {
                let scrypt = util.promisify(crypto.scrypt);
                let [userHash, userSalt] = user.password.split('.');
                try {
                    let encryptedPassword = await scrypt(password, userSalt, 64);
                    let hash = encryptedPassword.toString('hex');
                    if (user.password == `${hash}.${userSalt}`) {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'User found',
                            message: {
                                userDetails: user,
                                token: jwt.sign({ emailAddress: user.emailAddress }, 'abcdefghijklmnopqrstuvwxyz')
                            }
                        };
                        res.json(successMessage);
                    } else {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'User not found',
                            message: 'Wrong password'
                        };
                        res.json(errorMessage);
                    }
                } catch (err) {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while fetching user. Please try again',
                        message: 'Wrong email'
                    };
                    res.json(errorMessage);
                }
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'User not found',
                    message: 'Wrong email'
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error ocurred while fetching user. Please try again',
                message: 'Wrong email'
            };
            res.json(errorMessage);
        })
})

// ambassador requests

ambassadorRouter.post('/check_ambassador_email', (req, res) => {
    try {
        let extractedEmail = jwt.verify(req.body.userCode, '123456789poituuyets');
        NewAmbassadors.findOne({
            where: {
                emailAddress: extractedEmail.emailAddress
            }
        })
            .then(ambassadorData => {
                if (ambassadorData) {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Ambassadors data found',
                        summary: 'success',
                        message: ambassadorData
                    };
                    res.json(successMessage);
                } else {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'Ambassador data could not be found',
                        summary: 'error',
                        message: ''
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Ambassador data could not be found',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            })
    } catch (err) {
        let errorMessage = {
            statusCode: 400,
            statusMessage: 'Token is expired. Please contact administrator to continue',
            summary: 'error',
            message: ''
        };
        res.json(errorMessage);
    }
})

ambassadorRouter.post('/set_ambassador_password', async (req, res) => {
    try {
        let extractedEmail = jwt.verify(req.body.userCode, '123456789poituuyets');
        let scrypt = util.promisify(crypto.scrypt);
        let salt = crypto.randomBytes(16).toString('hex');
        let newPassword = await scrypt(req.body.password, salt, 64);
        let password = newPassword.toString('hex');
        NewAmbassadors.findOne({
            where: {
                emailAddress: extractedEmail.emailAddress
            }
        })
            .then(ambassadorData => {
                if (ambassadorData) {
                    Ambassadors.create({
                        firstName: ambassadorData.firstName,
                        lastName: ambassadorData.lastName,
                        emailAddress: ambassadorData.emailAddress,
                        phoneNumber: ambassadorData.phoneNumber,
                        password: `${password}.${salt}`,
                    })
                        .then(newAmbassadorData => {
                            NewAmbassadors.destroy({
                                where: {
                                    id: ambassadorData.id
                                }
                            })
                                .then(userData => {
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'Ambassadors data updated',
                                        summary: 'success',
                                        message: ambassadorData
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    let errorMessage = {
                                        statusCode: 400,
                                        statusMessage: 'Ambassador data could not be updated',
                                        summary: 'error',
                                        message: ''
                                    };
                                    res.json(errorMessage);
                                })
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'Ambassador data could not be updated. Please try again.',
                                summary: 'error',
                                message: ''
                            };
                            res.json(errorMessage);
                        })
                } else {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'Ambassador data could not be found',
                        summary: 'error',
                        message: ''
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Ambassador data could not be updated. Please try again.',
                    summary: 'error',
                    message: ''
                };
                res.json(errorMessage);
            })
    } catch (err) {
        let errorMessage = {
            statusCode: 400,
            statusMessage: 'Token is expired. Please contact administrator to continue',
            summary: 'error',
            message: ''
        };
        res.json(errorMessage);
    }
})

adminRouter.post('/newambassador', (req, res) => {
    Ambassadors.findOne({
        where: {
            emailAddress: req.body.emailAddress
        }
    })
        .then(ambassadorFound => {
            if (ambassadorFound) {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'Ambassador email already exists',
                    summary: 'failure',
                    message: ''
                };
                res.json(errorMessage);
            } else {
                // const transporter = nodemailer.createTransport({
                //     host: 'server106.web-hosting.com',
                //     port: 465,
                //     secure: true,
                //     transportMethod: 'SMTP',
                //     auth: {
                //         user: 'info@thisisalsoafrica.com',
                //         pass: 'Highziknewthing1992#'
                //     }
                // });
                const transporter = nodemailer.createTransport({
                    port: 25,
                    host: 'localhost',
                    tls: {
                        rejectUnauthorized: false
                    },
                });

                let ambassadorCode = jwt.sign({ emailAddress: req.body.emailAddress }, '123456789poituuyets', {
                    expiresIn: '3min'
                });

                let ambassadorURL = `http://localhost:5000/set_password/${ambassadorCode}`;

                var mailOptions = {
                    from: 'noreply@domain.com',
                    to: 'whatever@otherdomain.com',
                    subject: 'Confirm Email',
                    text: 'Please confirm your email',
                    html: '<p>Please confirm your email</p>'
                };

                NewAmbassadors.destroy({
                    where: {
                        emailAddress: req.body.emailAddress
                    }
                })
                    .then(ambassadorData => {
                        NewAmbassadors.create({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            emailAddress: req.body.emailAddress,
                            phoneNumber: req.body.phoneNumber,
                        })
                            .then(signupComplete => {
                                // transporter.sendMail(mailOptions, function (error, info) {
                                // if (error) {
                                //     console.log(error);
                                //     let errorMessage = {
                                //         statusCode: 400,
                                //         status: 'error',
                                //         summary: 'Ambassador could not be added',
                                //         message: {}
                                //     }
                                //     res.json(errorMessage);
                                // } else {
                                console.log(ambassadorURL);
                                let successMessage = {
                                    statusCode: 200,
                                    statusMessage: 'Ambassador saved successfully',
                                    summary: 'success',
                                    message: ''
                                };
                                res.json(successMessage);
                                // }
                                // });
                            })
                            .catch(err => {
                                console.log(err);
                                let errorMessage = {
                                    statusCode: 400,
                                    statusMessage: 'failure',
                                    summary: 'User could not be saved',
                                    message: err
                                };
                                res.json(errorMessage);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'An error occurred while trying to sign you up. Please try again.',
                            message: err
                        };
                        res.json(errorMessage);
                    })
            }
        })
        .catch(err => {
            console.log(err);
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to sign you up. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/get_all_data', checkAmbassador, (req, res) => {
    EventsRecords.findAll({
        where: {
            AmbassadorId: res.body.id
        },
        include: [{
            model: EventCategoriesData
        }]
    })
        .then(eventsData => {
            CommunityRecords.findAll({
                where: {
                    AmbassadorId: res.body.id
                },
                include: [{
                    model: CommunityCategoriesData
                }]
            })
                .then(communitiesData => {
                    BusinessRecords.findAll({
                        where: {
                            AmbassadorId: res.body.id
                        },
                        include: [{
                            model: BusinessesCategoriesData
                        }]
                    })
                        .then(businessData => {
                            let successMessage = {
                                statusCode: 200,
                                statusMessage: 'Data fetched successfully',
                                summary: 'success',
                                message: {
                                    eventsData,
                                    communitiesData,
                                    businessData
                                }
                            };
                            res.json(successMessage);
                        })
                        .catch(err => {
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'failure',
                                summary: 'An error occurred while trying to fetch data. Please try again.',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while trying to fetch data. Please try again.',
                        message: err
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while trying to fetch data. Please try again.',
                message: err
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/get_all_events', checkAmbassador, (req, res) => {
    EventsRecords.findAll({
        where: {
            AmbassadorId: res.body.id
        },
        include: [{
            model: EventCategoriesData
        }, {
            model: EventPricingPlans
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/get_all_visible_events', checkAmbassador, (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }],
        where: {
            AmbassadorId: res.body.id
        }
    })
        .then(allEvents => {
            let eventsTab = [];
            allEvents.forEach(events => {
                if (events.displayStatus) {
                    eventsTab.push(events);
                }
            })
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: eventsTab
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/get_all_hidden_events', checkAmbassador, (req, res) => {
    EventsRecords.findAll({
        include: [{
            model: EventCategoriesData
        }],
        where: {
            AmbassadorId: res.body.id
        }
    })
        .then(allEvents => {
            let eventsTab = [];
            allEvents.forEach(events => {
                if (!events.displayStatus) {
                    eventsTab.push(events);
                }
            })
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events fetched successfully',
                summary: 'success',
                message: eventsTab
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})
adminRouter.post('/asd', (req, res) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'eadelekeife@gmail.com', // like : abc@gmail.com
            pass: 'chemistry!'           // like : pass@123
        }
    });

    let mailOptions = {
        from: 'your.gmail.account@gmail.com',
        to: 'eadelekeife@gmail.com',
        subject: 'Check Mail',
        text: 'Its working node mailer'
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error.message);
        }
        console.log('success');
    });
})


ambassadorRouter.post('/', (req, res) => {
    let emailAddress = jwt.verify(req.body.ambassadorLink, '123456789poituuyets');
    if (emailAddress) {
        let salt = crypto.randomBytes(16).toString('hex');

        NewAmbassadors.findOne({
            where: {
                emailAddress
            }
        })
            .then(async ambassadorData => {
                if (ambassadorData) {
                    let scrypt = util.promisify(crypto.scrypt);
                    let encryptedPassword = await scrypt(password, salt, 64);
                    let hash = encryptedPassword.toString('hex');
                    Ambassadors.create({
                        firstName: ambassadorData.firstName,
                        lastName: ambassadorData.lastName,
                        emailAddress: ambassadorData.emailAddress,
                        phoneNumber: ambassadorData.phoneNumber,
                        password: `${hash}.${salt}`,
                    })
                        .then(signupComplete => {
                            NewAmbassadors.destroy({
                                where: {
                                    id: ambassadorData.id
                                }
                            })
                                .then(dataDeleted => {
                                    let successMessage = {
                                        statusCode: 200,
                                        statusMessage: 'success',
                                        summary: 'User saved successfully',
                                        message: ''
                                    };
                                    res.json(successMessage);
                                })
                                .catch(err => {
                                    let errorMessage = {
                                        statusCode: 400,
                                        statusMessage: 'failure',
                                        summary: 'An error occurred while trying to sign you up. Please try again.',
                                        message: err
                                    };
                                    res.json(errorMessage);
                                })
                        })
                        .catch(err => {
                            console.log(err);
                            let errorMessage = {
                                statusCode: 400,
                                statusMessage: 'failure',
                                summary: 'User could not be saved',
                                message: err
                            };
                            res.json(errorMessage);
                        })
                } else {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'Email not found. Please contact administrator to get new token',
                        message: ''
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                console.log(err);
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'An error occurred while trying to sign you up. Please try again.',
                    message: err
                };
                res.json(errorMessage);
            })
    } else {
        let errorMessage = {
            statusCode: 400,
            statusMessage: 'failure',
            summary: 'There is an error with your request. Your link is likely expired. Please contact administrator to continue.',
            message: err
        };
        res.json(errorMessage);
    }
})

ambassadorRouter.post('/signinambassador', (req, res) => {
    let { emailAddress, password } = req.body;
    Ambassadors.findOne({
        where: {
            emailAddress: emailAddress
        }
    })
        .then(async user => {
            if (user) {
                let scrypt = util.promisify(crypto.scrypt);
                let [userHash, userSalt] = user.password.split('.');
                try {
                    let encryptedPassword = await scrypt(password, userSalt, 64);
                    let hash = encryptedPassword.toString('hex');
                    if (user.password == `${hash}.${userSalt}`) {
                        let successMessage = {
                            statusCode: 200,
                            statusMessage: 'success',
                            summary: 'User found',
                            message: {
                                userDetails: user,
                                token: jwt.sign({ emailAddress: user.emailAddress }, 'abcdefghijklmnopqrstuvwxyz')
                            }
                        };
                        res.json(successMessage);
                    } else {
                        let errorMessage = {
                            statusCode: 400,
                            statusMessage: 'failure',
                            summary: 'User not found',
                            message: 'Wrong password'
                        };
                        res.json(errorMessage);
                    }
                } catch (err) {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'failure',
                        summary: 'An error occurred while fetching user. Please try again',
                        message: 'Wrong email'
                    };
                    res.json(errorMessage);
                }
            } else {
                let errorMessage = {
                    statusCode: 400,
                    statusMessage: 'failure',
                    summary: 'User not found',
                    message: 'Wrong email'
                };
                res.json(errorMessage);
            }
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error ocurred while fetching user. Please try again',
                message: 'Wrong email'
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/all_communities_data', (req, res) => {
    CommunityRecords.findAll({
        include: [{
            model: communityMembers
        }]
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities fetched successfully',
                summary: 'success',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.get('/all_communities_data/:id', (req, res) => {
    CommunityRecords.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: communityMembers,
            include: [{
                model: Users
            }]
        }]
    })
        .then(allCommunities => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities fetched successfully',
                summary: 'success',
                message: allCommunities
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})


ambassadorRouter.post('/acceptMembership', checkAmbassador, (req, res) => {
    communityMembers.update({
        accepted: true,
        dateAccepted: new Date()
    }, {
        where: {
            id: req.body.memberId,
            CommunityRecordId: req.body.communityId
        }
    })
        .then(dataUploaded => {
            CommunityRecords.findOne({
                where: {
                    id: req.body.communityId
                },
                include: [{
                    model: communityMembers,
                    include: [{
                        model: Users
                    }]
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Communities fetched successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while fetching communities',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.post('/suspendMembership', checkAmbassador, (req, res) => {
    communityMembers.update({
        accepted: false,
    }, {
        where: {
            id: req.body.memberId,
            CommunityRecordId: req.body.communityId
        }
    })
        .then(dataUploaded => {
            CommunityRecords.findOne({
                where: {
                    id: req.body.communityId
                },
                include: [{
                    model: communityMembers,
                    include: [{
                        model: Users
                    }]
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Communities fetched successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while fetching communities',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

ambassadorRouter.post('/deleteMembership', checkAmbassador, (req, res) => {
    communityMembers.destroy({
        where: {
            id: req.body.memberId,
            CommunityRecordId: req.body.communityId
        }
    })
        .then(dataUploaded => {
            CommunityRecords.findOne({
                where: {
                    id: req.body.communityId
                },
                include: [{
                    model: communityMembers,
                    include: [{
                        model: Users
                    }]
                }]
            })
                .then(allCommunities => {
                    let successMessage = {
                        statusCode: 200,
                        statusMessage: 'Communities fetched successfully',
                        summary: 'success',
                        message: allCommunities
                    };
                    res.json(successMessage);
                })
                .catch(err => {
                    let errorMessage = {
                        statusCode: 400,
                        statusMessage: 'An error occurred while fetching communities',
                        summary: 'failure',
                        message: ''
                    };
                    res.json(errorMessage);
                })
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})


// Normal Fetch Requests

apiRouter.get('/get_all_categories', (req, res) => {
    CommunityRecords.findAll({
        where: {
            displayStatus: true
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_visible_community_categories', (req, res) => {
    CommunityCategoriesData.findAll({
        where: {
            displayStatus: true
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Communities categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching communities categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_visible_business_categories', (req, res) => {
    BusinessesCategoriesData.findAll({
        where: {
            displayStatus: true
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Business categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching business categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_events', checkAdmin, (req, res) => {
    EventsRecords.findAll({})
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Events fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_visible_event_categories', (req, res) => {
    EventCategoriesData.findAll({
        where: {
            displayStatus: true
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'Events categories fetched successfully',
                summary: 'success',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'An error occurred while fetching events categories',
                summary: 'failure',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_all_event_subcategories', checkAdmin, (req, res) => {
    EventSubCategories.findAll({})
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Events sub-categories fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events sub-categories',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/get_specific_event_categories/:categoryId', checkAdmin, (req, res) => {
    EventCategoriesData.findAll({
        where: {
            id: req.params.categoryId
        },
        includes: [{
            model: EventSubCategories
        }]
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Events categories fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events categories',
                message: ''
            };
            res.json(errorMessage);
        })
})

apiRouter.get('/eventtag/:tagId', (req, res) => {
    EventCategoryTags.findOne({
        where: {
            id: req.params.tagId
        }
    })
        .then(allEvents => {
            let successMessage = {
                statusCode: 200,
                statusMessage: 'success',
                summary: 'Events categories fetched successfully',
                message: allEvents
            };
            res.json(successMessage);
        })
        .catch(err => {
            let errorMessage = {
                statusCode: 400,
                statusMessage: 'failure',
                summary: 'An error occurred while fetching events categories',
                message: ''
            };
            res.json(errorMessage);
        })
})



const port = process.env.PORT || 8000;

app.listen(port, console.log("Server listening on port", port));