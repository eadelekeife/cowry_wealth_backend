const jwt = require('jsonwebtoken');
const { Ambassadors, Users, Administrator } = require('../connection');

const checkAdmin = (req, res, next) => {
    if (req.headers.authorization) {
        let token = req.headers.authorization.split(' ')[1];
        let tokenId = jwt.verify(token, 'abcdefghijklmnopqrstuvwxyz');
        Administrator.findOne({
            where: {
                emailAddress: tokenId.emailAddress
            }
        })
            .then(userData => {
                if (userData) {
                    res.body = userData;
                    next();
                } else {
                    let errorMessage = {
                        status: 408,
                        statusMessage: "failure",
                        summary: 'Authorization failed. You need to log in as an Administrator to access this route',
                        message: {}
                    };
                    res.json(errorMessage);
                }
            })
            .catch(err => {
                let errorMessage = {
                    status: 503,
                    statusMessage: "failure",
                    summary: 'An error occurred while checking user authorization',
                    message: {}
                };
                res.json(errorMessage);
            })
    } else {
        let errorMessage = {
            status: 408,
            statusMessage: "failure",
            summary: 'Authorization failed. You need to log in as an Administrator to access this route',
            message: {}
        };
        res.json(errorMessage);
    }
}

const checkAmbassador = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            let token = req.headers.authorization.split(' ')[1];
            let tokenId = jwt.verify(token, 'abcdefghijklmnopqrstuvwxyz');
            Ambassadors.findOne({
                where: {
                    emailAddress: tokenId.emailAddress
                }
            })
                .then(userData => {
                    if (userData) {
                        res.body = userData;
                        next();
                    } else {
                        let errorMessage = {
                            status: 408,
                            statusMessage: "failure",
                            summary: 'Authorization failed. You need to log in as an Ambassador to access this route',
                            message: {}
                        };
                        res.json(errorMessage);
                    }
                })
                .catch(err => {
                    let errorMessage = {
                        status: 503,
                        statusMessage: "failure",
                        summary: 'An error occurred while checking user authorization',
                        message: {}
                    };
                    res.json(errorMessage);
                })
        } catch (err) {
            let errorMessage = {
                status: 408,
                statusMessage: "failure",
                summary: 'Authorization failed. You need to log in as an ambassador to access this route',
                message: {}
            };
            res.json(errorMessage);
        }
    } else {
        let errorMessage = {
            status: 408,
            statusMessage: "failure",
            summary: 'Authorization failed. You need to log in as an ambassador to access this route',
            message: {}
        };
        res.json(errorMessage);
    }
}

const checkUser = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            let token = req.headers.authorization.split(' ')[1];
            let tokenId = jwt.verify(token, 'abcdefghijklmnopqrstuvwxyz');
            Users.findOne({
                where: {
                    emailAddress: tokenId.emailAddress
                }
            })
                .then(userData => {
                    if (userData) {
                        res.body = userData;
                        next();
                    } else {
                        let errorMessage = {
                            status: 408,
                            statusMessage: "failure",
                            summary: 'Authorization failed. You need to log in to access this route',
                            message: {}
                        };
                        res.json(errorMessage);
                    }
                })
                .catch(err => {
                    let errorMessage = {
                        status: 503,
                        statusMessage: "failure",
                        summary: 'An error occurred while checking user authorization',
                        message: {}
                    };
                    res.json(errorMessage);
                })
        } catch (err) {
            let errorMessage = {
                status: 408,
                statusMessage: "failure",
                summary: 'Authorization failed. You need to log in to access this route',
                message: {}
            };
            res.json(errorMessage);
        }
    } else {
        let errorMessage = {
            status: 408,
            statusMessage: "failure",
            summary: 'Authorization failed. You need to log in to access this route',
            message: {}
        };
        res.json(errorMessage);
    }
}

module.exports = {
    checkAdmin,
    checkAmbassador,
    checkUser
}