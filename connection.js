const majorSequelize = require('sequelize');


const sequelize = new majorSequelize('cowrywealth', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false
})

// users
const Users = sequelize.define('Users', {
    firstName: majorSequelize.STRING(500),
    lastName: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    password: majorSequelize.STRING(500),
    profilePicture: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500),
    gender: majorSequelize.STRING(500),
    lga: majorSequelize.STRING(500),
    address: majorSequelize.STRING(500),
})

const communityMembers = sequelize.define('communityMembers', {
    accepted: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    dateAccepted: {
        type: majorSequelize.DATE
    }
})

const eventReviews = sequelize.define('eventReviews', {
    message: majorSequelize.TEXT,
    star: majorSequelize.STRING(100)
})

const communityReviews = sequelize.define('communityReviews', {
    message: majorSequelize.TEXT,
    star: majorSequelize.STRING(100)
})

const businessReviews = sequelize.define('businessReviews', {
    message: majorSequelize.TEXT,
    star: majorSequelize.STRING(100)
})

const savedEvents = sequelize.define('savedEvents', {
})

const savedCommunities = sequelize.define('savedCommunities', {
})

const savedBusinesses = sequelize.define('savedBusinesses', {
})

// others
const State = sequelize.define('State', {
    name: majorSequelize.STRING(500)
})

const LocalGovernment = sequelize.define('LocalGovernment', {
    name: majorSequelize.STRING(500)
})


// events
const EventsRecords = sequelize.define('EventsRecords', {
    eventTitle: majorSequelize.STRING(500),
    displayImage: majorSequelize.STRING(500),
    mainImage: majorSequelize.STRING(500),
    eventDescription: majorSequelize.TEXT('long'),
    address: majorSequelize.STRING(500),
    eventOrganizer: majorSequelize.STRING(500),
    localGovernment: majorSequelize.STRING(500),
    type: majorSequelize.STRING(500),
    eventURL: majorSequelize.STRING(500),
    eventStarts: majorSequelize.STRING(500),
    eventEnds: majorSequelize.STRING(500),
    startTime: majorSequelize.STRING(500),
    endTime: majorSequelize.STRING(500),
    eventPricing: majorSequelize.STRING(500),
    wheelChair: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    infant: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    transport: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    traveller: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    backProblems: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    pregnant: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    recommended: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    physicalFitness: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    infantSeat: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    pickup: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    trending: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const EventPricingPlans = sequelize.define('EventPricingPlans', {
    planName: majorSequelize.STRING(500),
    planPrice: majorSequelize.STRING(500),
})

const EventsFAQs = sequelize.define('EventsFAQs', {
    questions: majorSequelize.STRING(500),
    answers: majorSequelize.TEXT('long'),
})

const EventCategoriesData = sequelize.define('EventCategoriesData', {
    categoryName: majorSequelize.STRING(500),
    categoryImage: majorSequelize.STRING(500),
    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const EventCategoryTags = sequelize.define('EventCategoryTags', {
    tagName: majorSequelize.STRING(500)
})

// communities

const CommunityRecords = sequelize.define('CommunityRecords', {
    communityName: majorSequelize.STRING(500),
    displayImage: majorSequelize.STRING(500),
    mainImage: majorSequelize.STRING(500),
    communityDescription: majorSequelize.TEXT('long'),
    state: majorSequelize.STRING(500),
    localGovernment: majorSequelize.STRING(500),
    address: majorSequelize.STRING(500),
    communityFacebook: majorSequelize.STRING(500),
    communityInstagram: majorSequelize.STRING(500),
    communityTwitter: majorSequelize.STRING(500),
    wheelChair: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    infant: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    transport: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    traveller: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    backProblems: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    pregnant: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    recommended: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    physicalFitness: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    infantSeat: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    pickup: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    },
    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const CommunityFAQs = sequelize.define('CommunityFAQs', {
    questions: majorSequelize.STRING(500),
    answers: majorSequelize.TEXT('long'),
})

const CommunityCategoriesData = sequelize.define('CommunityCategoriesData', {
    categoryName: majorSequelize.STRING(500),
    categoryImage: majorSequelize.STRING(500),
    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const CommunityCategoryTags = sequelize.define('CommunityCategoryTags', {
    tagName: majorSequelize.STRING(500)
})

// businesses
const BusinessRecords = sequelize.define('BusinessRecords', {
    businessName: majorSequelize.STRING(500),
    displayImage: majorSequelize.STRING(500),
    mainImage: majorSequelize.STRING(500),
    businessOwner: majorSequelize.STRING(500),
    businessDescription: majorSequelize.TEXT('long'),
    state: majorSequelize.STRING(500),
    localGovernment: majorSequelize.STRING(500),
    address: majorSequelize.STRING(500),
    staffCount: majorSequelize.STRING(500),
    businessType: majorSequelize.STRING(500),
    openingTime: majorSequelize.STRING(500),
    closingTime: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    website: majorSequelize.STRING(500),
    businessFacebook: majorSequelize.STRING(500),
    businessInstagram: majorSequelize.STRING(500),
    businessTwitter: majorSequelize.STRING(500),

    monday: majorSequelize.STRING(500),
    tuesday: majorSequelize.STRING(500),
    wednesday: majorSequelize.STRING(500),
    thursday: majorSequelize.STRING(500),
    friday: majorSequelize.STRING(500),
    saturday: majorSequelize.STRING(500),
    sunday: majorSequelize.STRING(500),



    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const BusinessFAQs = sequelize.define('BusinessFAQs', {
    questions: majorSequelize.STRING(500),
    answers: majorSequelize.TEXT('long'),
})

const BusinessOpeningHours = sequelize.define('BusinessOpeningHours', {
    day: majorSequelize.STRING(500),
    openingTime: majorSequelize.STRING(500),
    closingTime: majorSequelize.STRING(500),
})

const BusinessesCategoriesData = sequelize.define('BusinessesCategoriesData', {
    categoryName: majorSequelize.STRING(500),
    categoryImage: majorSequelize.STRING(500),
    displayStatus: {
        type: majorSequelize.BOOLEAN,
        defaultValue: false
    }
})

const BusinessCategoryTags = sequelize.define('BusinessCategoryTags', {
    tagName: majorSequelize.STRING(500)
})

const BusinessOffering = sequelize.define('BusinessOffering', {
    productName: majorSequelize.STRING(500),
})

// ambassadors
const Ambassadors = sequelize.define('Ambassadors', {
    firstName: majorSequelize.STRING(500),
    lastName: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500),
    password: majorSequelize.STRING(500),
    authorized: {
        type: majorSequelize.BOOLEAN,
        defaultValue: true
    }
})

const NewAmbassadors = sequelize.define('NewAmbassadors', {
    firstName: majorSequelize.STRING(500),
    lastName: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500)
})

// administrator
const Administrator = sequelize.define('Administrator', {
    firstName: majorSequelize.STRING(500),
    lastName: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500),
    password: majorSequelize.STRING(500),
    authorized: {
        type: majorSequelize.BOOLEAN,
        defaultValue: true
    }
})

const NewAdministrator = sequelize.define('NewAdministrator', {
    firstName: majorSequelize.STRING(500),
    lastName: majorSequelize.STRING(500),
    emailAddress: majorSequelize.STRING(500),
    phoneNumber: majorSequelize.STRING(500)
})

// events

EventsRecords.belongsTo(EventCategoriesData, { foreignKeyConstraint: true });
EventCategoriesData.hasMany(EventsRecords, { foreignKeyConstraint: true });

EventCategoryTags.belongsTo(EventCategoriesData, { foreignKeyConstraint: true });
EventCategoriesData.hasMany(EventCategoryTags, { foreignKeyConstraint: true });

EventsRecords.hasMany(EventPricingPlans, { foreignKeyConstraint: true });
EventPricingPlans.belongsTo(EventsRecords, { foreignKeyConstraint: true });

EventsRecords.hasMany(EventsFAQs, { foreignKeyConstraint: true });
EventsFAQs.belongsTo(EventsRecords, { foreignKeyConstraint: true });

// communities

CommunityRecords.belongsTo(CommunityCategoriesData, { foreignKeyConstraint: true });
CommunityCategoriesData.hasMany(CommunityRecords, { foreignKeyConstraint: true });

CommunityCategoryTags.belongsTo(CommunityCategoriesData, { foreignKeyConstraint: true });
CommunityCategoriesData.hasMany(CommunityCategoryTags, { foreignKeyConstraint: true });

CommunityRecords.hasMany(CommunityFAQs, { foreignKeyConstraint: true });
CommunityFAQs.belongsTo(CommunityRecords, { foreignKeyConstraint: true });

// businesses

BusinessRecords.belongsTo(BusinessesCategoriesData, { foreignKeyConstraint: true });
BusinessesCategoriesData.hasMany(BusinessRecords, { foreignKeyConstraint: true });

BusinessCategoryTags.belongsTo(BusinessesCategoriesData, { foreignKeyConstraint: true });
BusinessesCategoriesData.hasMany(BusinessCategoryTags, { foreignKeyConstraint: true });

BusinessRecords.hasMany(BusinessFAQs, { foreignKeyConstraint: true });
BusinessFAQs.belongsTo(BusinessRecords, { foreignKeyConstraint: true });

BusinessRecords.hasMany(BusinessOpeningHours, { foreignKeyConstraint: true });
BusinessOpeningHours.belongsTo(BusinessRecords, { foreignKeyConstraint: true });

BusinessRecords.hasMany(BusinessOffering, { foreignKeyConstraint: true });
BusinessOffering.belongsTo(BusinessRecords, { foreignKeyConstraint: true });

//ambassadors
EventsRecords.belongsTo(Ambassadors, { foreignKeyConstraint: true });
Ambassadors.hasMany(EventsRecords, { foreignKeyConstraint: true });

CommunityRecords.belongsTo(Ambassadors, { foreignKeyConstraint: true });
Ambassadors.hasMany(CommunityRecords, { foreignKeyConstraint: true });

BusinessRecords.belongsTo(Ambassadors, { foreignKeyConstraint: true });
Ambassadors.hasMany(BusinessRecords, { foreignKeyConstraint: true });

//administrator
Ambassadors.belongsTo(Administrator, { foreignKeyConstraint: true });
Administrator.hasOne(Ambassadors, { foreignKeyConstraint: true });

//others
LocalGovernment.belongsTo(State, { foreignKeyConstraint: true });
State.hasMany(LocalGovernment, { foreignKeyConstraint: true });

State.hasMany(BusinessRecords, { foreignKeyConstraint: true });
State.hasMany(EventsRecords, { foreignKeyConstraint: true });
State.hasMany(CommunityRecords, { foreignKeyConstraint: true });

State.hasMany(Users, { foreignKeyConstraint: true });

savedEvents.belongsTo(EventsRecords, { foreignKeyConstraint: true });
savedEvents.belongsTo(Users, { foreignKeyConstraint: true });

savedBusinesses.belongsTo(BusinessRecords, { foreignKeyConstraint: true });
savedBusinesses.belongsTo(Users, { foreignKeyConstraint: true });

savedCommunities.belongsTo(CommunityRecords, { foreignKeyConstraint: true });
savedCommunities.belongsTo(Users, { foreignKeyConstraint: true });

communityMembers.belongsTo(CommunityRecords, { foreignKeyConstraint: true });
CommunityRecords.hasMany(communityMembers, { foreignKeyConstraint: true });
communityMembers.belongsTo(Users, { foreignKeyConstraint: true });

eventReviews.belongsTo(EventsRecords, { foreignKeyConstraint: true });
EventsRecords.hasMany(eventReviews, { foreignKeyConstraint: true });

eventReviews.belongsTo(Users, { foreignKeyConstraint: true });
Users.hasMany(eventReviews, { foreignKeyConstraint: true });

communityReviews.belongsTo(CommunityRecords, { foreignKeyConstraint: true });
CommunityRecords.hasMany(communityReviews, { foreignKeyConstraint: true });

communityReviews.belongsTo(Users, { foreignKeyConstraint: true });
Users.hasMany(communityReviews, { foreignKeyConstraint: true });

businessReviews.belongsTo(BusinessRecords, { foreignKeyConstraint: true });
BusinessRecords.hasMany(businessReviews, { foreignKeyConstraint: true });

businessReviews.belongsTo(Users, { foreignKeyConstraint: true });
Users.hasMany(businessReviews, { foreignKeyConstraint: true });

sequelize.sync({ alter: true });

module.exports = {
    Users,
    EventsRecords,
    EventPricingPlans,
    EventCategoryTags,
    EventCategoriesData,
    EventsFAQs,
    CommunityRecords,
    CommunityCategoryTags,
    CommunityCategoriesData,
    CommunityFAQs,
    BusinessRecords,
    BusinessesCategoriesData,
    BusinessOpeningHours,
    BusinessOffering,
    BusinessFAQs,
    BusinessCategoryTags,
    Ambassadors,
    NewAmbassadors,
    Administrator,
    NewAdministrator,
    State,
    LocalGovernment,
    savedBusinesses,
    savedCommunities,
    savedEvents,
    communityMembers,
    eventReviews,
    communityReviews,
    businessReviews
}