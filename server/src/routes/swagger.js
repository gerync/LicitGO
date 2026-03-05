import swaggerJsdoc from 'swagger-jsdoc';
import configs from '../configs/Configs.js';

// tekintettel arra, hogy nem ismerem a swagger-jsdoc könyvtárat
// a ez a fájl a következő github repo példáján alapul:
// https://tinyurl.com/swagger-example

// #region Swagger api dokumentáció definíció
const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'LicitGO API',
        version: '1.0.0',
        description: 'OpenAPI documentation for the LicitGO backend.',
    },
    servers: [
        {
            url: configs.server.domain(),
            description: 'Current server',
        },
    ],
    tags: [
        { name: 'Auth', description: 'Registration and login' },
        { name: 'User', description: 'User profile and settings' },
        { name: 'Password', description: 'Password reset flows' },
        { name: '2FA', description: 'Two-factor authentication management' },
        { name: 'Auction', description: 'Auction and car management' },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'auth',
                description: 'HTTP-only auth cookie set by the login endpoint',
            },
        },
        schemas: {
            MessageResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['usertag', 'password', 'passwordconfirm', 'email', 'fullname', 'mobile', 'gender', 'birthdate'],
                properties: {
                    usertag: { type: 'string', example: 'carfan123' },
                    password: { type: 'string', format: 'password', minLength: 8, maxLength: 32 },
                    passwordconfirm: { type: 'string', format: 'password', description: 'Must match password' },
                    email: { type: 'string', format: 'email' },
                    fullname: { type: 'string' },
                    mobile: { type: 'string', example: '+3612345678' },
                    gender: { type: 'string', example: 'male' },
                    birthdate: { type: 'string', format: 'date', example: '1990-01-01' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                    identifier: { type: 'string', description: 'Email, usertag, or mobile number' },
                    password: { type: 'string', format: 'password' },
                    keeplogin: { type: 'boolean', default: false },
                },
            },
            LoginTfaResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    temp_token: { type: 'string', description: 'Short-lived token for completing 2FA' },
                },
            },
            VerifyTfaRequest: {
                type: 'object',
                required: ['code'],
                properties: {
                    code: { type: 'string', example: '123456', description: '6-digit TOTP code' },
                    keeplogin: { type: 'boolean', default: false },
                },
            },
            EnableTfaResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    qrCode: { type: 'string', description: 'Base64 QR code data URL (only on initial request)' },
                    secret: { type: 'string', description: 'TOTP secret (only on initial request)' },
                },
            },
            DisableTfaRequest: {
                type: 'object',
                properties: {
                    requestEmail: { type: 'boolean', description: 'Set to true to request email code' },
                    tfaCode: { type: 'string', example: '123456', description: '6-digit TOTP code' },
                    backupCode: { type: 'string', example: 'ABC123DEF456', description: '8-16 character backup code' },
                    emailCode: { type: 'string', example: '123456', description: '6-digit email verification code' },
                },
                description: 'Provide ONE of: requestEmail=true, tfaCode, backupCode, or emailCode',
            },
            ChangeDataRequest: {
                type: 'object',
                properties: {
                    usertag: { type: 'string' },
                    fullname: { type: 'string' },
                    mobile: { type: 'string' },
                    gender: { type: 'string', example: 'female' },
                },
                description: 'At least one field must be provided.',
            },
            SettingsRequest: {
                type: 'object',
                properties: {
                    language: { type: 'string', example: 'EN' },
                    darkmode: { type: 'boolean', example: true },
                    currency: { type: 'string', example: 'USD' },
                },
            },
            ProfileResponse: {
                type: 'object',
                properties: {
                    usertag: { type: 'string' },
                    fullname: { type: 'string' },
                    email: { type: 'string' },
                    mobile: { type: 'string' },
                    gender: { type: 'string' },
                    birthdate: { type: 'string' },
                    type: { type: 'string' },
                    auctionCount: { type: 'integer' },
                    bidCount: { type: 'integer' },
                },
            },
            PasswordResetRequest: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                },
            },
            PasswordResetConfirmRequest: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                    code: { type: 'string', description: '6-digit code, accepted in body or query param' },
                    newPassword: { type: 'string', format: 'password' },
                },
            },
            AddCarRequest: {
                type: 'object',
                required: ['manufacturer', 'model', 'color', 'odometerKM', 'modelyear', 'efficiency', 'efficiencyunit', 'enginecapacity', 'fueltype', 'transmission', 'bodytype', 'doors', 'seats', 'vin'],
                properties: {
                    manufacturer: { type: 'string', example: 'Toyota' },
                    model: { type: 'string', example: 'Corolla' },
                    color: { type: 'string', example: 'blue' },
                    odometerKM: { type: 'integer', example: 120000 },
                    modelyear: { type: 'integer', example: 2019 },
                    efficiency: { type: 'number', format: 'float', example: 85.5 },
                    efficiencyunit: { type: 'string', enum: ['HP', 'kW'], example: 'HP' },
                    enginecapacity: { type: 'integer', example: 1598 },
                    fueltype: { type: 'string', enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'] },
                    transmission: { type: 'string', enum: ['manual', 'automatic', 'semi-automatic', 'CVT', 'dual-clutch', 'other'] },
                    bodytype: { type: 'string', enum: ['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other'] },
                    description: { type: 'string' },
                    emissionsGKM: { type: 'integer', nullable: true },
                    doors: { type: 'integer', example: 4 },
                    seats: { type: 'integer', example: 5 },
                    vin: { type: 'string', minLength: 17, maxLength: 17 },
                    maxspeedKMH: { type: 'integer', nullable: true },
                    zeroToHundredSec: { type: 'number', format: 'float', nullable: true },
                    weightKG: { type: 'integer', nullable: true },
                    features: { type: 'object', additionalProperties: true },
                    factoryExtras: { type: 'string' },
                },
            },
            AddCarResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    carId: { type: 'integer' },
                },
            },
            AddAuctionRequest: {
                type: 'object',
                required: ['carid', 'startingBid', 'reservePrice', 'starttime', 'endtime'],
                properties: {
                    carid: { type: 'integer', example: 12 },
                    startingBid: { type: 'number', example: 5000 },
                    reservePrice: { type: 'number', example: 8000 },
                    starttime: { type: 'string', format: 'date-time' },
                    endtime: { type: 'string', format: 'date-time' },
                },
            },
            AddAuctionResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    auctionId: { type: 'integer' },
                },
            },
            PlaceBidRequest: {
                type: 'object',
                required: ['bidamount'],
                properties: {
                    bidamount: { type: 'number', example: 9500.00, description: 'Bid amount in user currency' },
                },
            },
            PlaceBidResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    auctionID: { type: 'integer' },
                    bidAmount: { type: 'number' },
                    bidCurrency: { type: 'string' },
                },
            },
            AuctionListResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    auctions: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                auctionId: { type: 'integer' },
                                carId: { type: 'integer' },
                                currentPrice: { type: 'number', description: 'Current highest bid or starting price in requested currency' },
                                reservePriceUSD: { type: 'number' },
                                reserveMet: { type: 'boolean', description: 'Whether reserve price has been met' },
                                bidCount: { type: 'integer' },
                                starttime: { type: 'string', format: 'date-time' },
                                endtime: { type: 'string', format: 'date-time' },
                                status: { type: 'string', enum: ['upcoming', 'ongoing', 'ended'], description: 'Localized if lang=HU' },
                                timeRemaining: { type: 'integer', description: 'Seconds remaining (or until start)' },
                                car: {
                                    type: 'object',
                                    properties: {
                                        manufacturer: { type: 'string' },
                                        model: { type: 'string' },
                                        modelyear: { type: 'integer' },
                                        odometerKM: { type: 'integer' },
                                        efficiency: { type: 'number' },
                                        efficiencyunit: { type: 'string' },
                                        enginecapacityCC: { type: 'integer' },
                                        fueltype: { type: 'string' },
                                        transmission: { type: 'string' },
                                        bodytype: { type: 'string' },
                                        mainImagepath: { type: 'string', nullable: true, description: 'Full URL to first car image' },
                                    },
                                },
                            },
                        },
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            totalResults: { type: 'integer' },
                            resultsPerPage: { type: 'integer' },
                            hasNextPage: { type: 'boolean' },
                            hasPreviousPage: { type: 'boolean' },
                        },
                    },
                },
            },
            AuctionDetailsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    auction: {
                        type: 'object',
                        properties: {
                            auctionId: { type: 'integer' },
                            carId: { type: 'integer' },
                            currentPrice: { type: 'number', description: 'In requested currency' },
                            reserveMet: { type: 'boolean' },
                            currency: { type: 'string' },
                            starttime: { type: 'string', format: 'date-time' },
                            endtime: { type: 'string', format: 'date-time' },
                            status: { type: 'string', enum: ['upcoming', 'ongoing', 'ended'], description: 'Localized if lang=HU' },
                            timeRemaining: { type: 'integer', description: 'Seconds remaining' },
                            bidCount: { type: 'integer' },
                            bidHistory: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        amount: { type: 'number', description: 'In requested currency' },
                                        bidtime: { type: 'string', format: 'date-time' },
                                        bidder: { type: 'string', description: 'Usertag' },
                                    },
                                },
                            },
                            car: {
                                type: 'object',
                                properties: {
                                    manufacturer: { type: 'string' },
                                    model: { type: 'string' },
                                    odometerKM: { type: 'integer' },
                                    modelyear: { type: 'integer' },
                                    efficiency: { type: 'number' },
                                    efficiencyunit: { type: 'string' },
                                    enginecapacityCC: { type: 'integer' },
                                    fueltype: { type: 'string' },
                                    emissionsGKM: { type: 'integer', nullable: true },
                                    transmission: { type: 'string' },
                                    bodytype: { type: 'string' },
                                    color: { type: 'string' },
                                    doors: { type: 'integer' },
                                    seats: { type: 'integer' },
                                    vin: { type: 'string' },
                                    maxspeedKMH: { type: 'integer', nullable: true },
                                    zeroToHundredSec: { type: 'number', nullable: true },
                                    weightKG: { type: 'integer', nullable: true },
                                    features: { type: 'object', nullable: true, additionalProperties: true },
                                    factoryExtras: { type: 'string', nullable: true },
                                    owner: {
                                        type: 'object',
                                        properties: {
                                            usertag: { type: 'string' },
                                            fullname: { type: 'string' },
                                        },
                                    },
                                    images: {
                                        type: 'array',
                                        items: { type: 'string', description: 'Full URL to image' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
                    },
                },
                responses: {
                    201: {
                        description: 'User created',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
                        },
                    },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login with credentials',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
                    },
                },
                responses: {
                    200: {
                        description: 'Login successful, auth cookie is set',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
                        },
                    },
                    203: {
                        description: 'Two-factor authentication required',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/LoginTfaResponse' } },
                        },
                    },
                    401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Clear auth cookies and logout',
                security: [{ cookieAuth: [] }],
                responses: {
                    200: {
                        description: 'Logged out',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
                        },
                    },
                },
            },
        },
        '/auth/verify-2fa': {
            post: {
                tags: ['Auth'],
                summary: 'Verify 2FA code after login',
                description: 'Complete login by verifying TOTP code. Requires temp_token from login response.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/VerifyTfaRequest' } },
                    },
                },
                responses: {
                    200: {
                        description: '2FA verified, auth cookie set',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
                        },
                    },
                    401: { description: 'Invalid code or expired temp token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: '2FA not enabled', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/user/tfa/enable': {
            post: {
                tags: ['2FA'],
                summary: 'Enable 2FA for account',
                description: 'Two-step process: 1) Request without code to get QR code, 2) Submit code to enable',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    code: { type: 'string', example: '123456', description: 'Optional: 6-digit code to verify and enable' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'QR code generated or 2FA enabled',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/EnableTfaResponse' } },
                        },
                    },
                    400: { description: 'Already enabled or invalid code format', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Invalid verification code', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/user/tfa/disable': {
            post: {
                tags: ['2FA'],
                summary: 'Disable 2FA for account',
                description: 'Three methods: 1) Current 2FA code, 2) Backup code, or 3) Email verification code',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/DisableTfaRequest' } },
                    },
                },
                responses: {
                    200: {
                        description: '2FA disabled or email code sent',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
                        },
                    },
                    400: { description: 'Not enabled or invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Invalid code', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'No active email code', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/user/changedata': {
            put: {
                tags: ['User'],
                summary: 'Update user data',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/ChangeDataRequest' } },
                    },
                },
                responses: {
                    200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/user/settings': {
            put: {
                tags: ['User'],
                summary: 'Update UI settings and cookies',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/SettingsRequest' } },
                    },
                },
                responses: {
                    200: { description: 'Settings saved', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                },
            },
        },
        '/user/profile/{usertag}': {
            get: {
                tags: ['User'],
                summary: 'Public profile by usertag',
                parameters: [
                    {
                        in: 'path',
                        name: 'usertag',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Profile data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileResponse' } } } },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/user/password/reset/request': {
            post: {
                tags: ['Password'],
                summary: 'Request a password reset code',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/PasswordResetRequest' } },
                    },
                },
                responses: {
                    200: { description: 'Reset email dispatched when email exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                },
            },
        },
        '/user/password/reset': {
            post: {
                tags: ['Password'],
                summary: 'Reset password using code',
                parameters: [
                    {
                        in: 'query',
                        name: 'code',
                        required: false,
                        schema: { type: 'string', example: '123456' },
                        description: '6-digit code can be supplied here or in the request body',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/PasswordResetConfirmRequest' } },
                    },
                },
                responses: {
                    200: { description: 'Password reset', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
                    400: { description: 'Invalid code or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auction/addcar': {
            post: {
                tags: ['Auction'],
                summary: 'Add a new car',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AddCarRequest' } },
                    },
                },
                responses: {
                    201: { description: 'Car created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AddCarResponse' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Duplicate VIN', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auction/addauction': {
            post: {
                tags: ['Auction'],
                summary: 'Create an auction for a car',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AddAuctionRequest' } },
                    },
                },
                responses: {
                    201: { description: 'Auction created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AddAuctionResponse' } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Not owner of car', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Car not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Active auction exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auction/list': {
            get: {
                tags: ['Auction'],
                summary: 'List auctions with filtering and sorting',
                parameters: [
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number for pagination',
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', default: 20, maximum: 100 },
                        description: 'Results per page',
                    },
                    {
                        in: 'query',
                        name: 'manufacturer',
                        schema: { type: 'string' },
                        description: 'Filter by car manufacturer',
                    },
                    {
                        in: 'query',
                        name: 'model',
                        schema: { type: 'string' },
                        description: 'Filter by car model',
                    },
                    {
                        in: 'query',
                        name: 'minYear',
                        schema: { type: 'integer' },
                        description: 'Minimum model year',
                    },
                    {
                        in: 'query',
                        name: 'maxYear',
                        schema: { type: 'integer' },
                        description: 'Maximum model year',
                    },
                    {
                        in: 'query',
                        name: 'fueltype',
                        schema: { type: 'string', enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other'] },
                        description: 'Filter by fuel type',
                    },
                    {
                        in: 'query',
                        name: 'bodytype',
                        schema: { type: 'string', enum: ['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other'] },
                        description: 'Filter by body type',
                    },
                    {
                        in: 'query',
                        name: 'color',
                        schema: { type: 'string' },
                        description: 'Filter by color',
                    },
                    {
                        in: 'query',
                        name: 'minOdometer',
                        schema: { type: 'integer' },
                        description: 'Minimum odometer in KM',
                    },
                    {
                        in: 'query',
                        name: 'maxOdometer',
                        schema: { type: 'integer' },
                        description: 'Maximum odometer in KM',
                    },
                    {
                        in: 'query',
                        name: 'status',
                        schema: { type: 'string', enum: ['upcoming', 'ongoing', 'ended'] },
                        description: 'Filter by auction status',
                    },
                    {
                        in: 'query',
                        name: 'minPrice',
                        schema: { type: 'number' },
                        description: 'Minimum current price in USD',
                    },
                    {
                        in: 'query',
                        name: 'maxPrice',
                        schema: { type: 'number' },
                        description: 'Maximum current price in USD',
                    },
                    {
                        in: 'query',
                        name: 'minReservePrice',
                        schema: { type: 'number' },
                        description: 'Minimum reserve price in USD',
                    },
                    {
                        in: 'query',
                        name: 'maxReservePrice',
                        schema: { type: 'number' },
                        description: 'Maximum reserve price in USD',
                    },
                    {
                        in: 'query',
                        name: 'sortBy',
                        schema: { type: 'string', enum: ['price', 'bidcount', 'manufacturer', 'model', 'date'], default: 'date' },
                        description: 'Sort field',
                    },
                    {
                        in: 'query',
                        name: 'sortOrder',
                        schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
                        description: 'Sort direction',
                    },
                ],
                responses: {
                    200: { description: 'List of auctions', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuctionListResponse' } } } },
                    400: { description: 'Invalid parameters', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auction/{auctionId}': {
            get: {
                tags: ['Auction'],
                summary: 'Get detailed auction information',
                parameters: [
                    {
                        in: 'path',
                        name: 'auctionId',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'Auction ID',
                    },
                ],
                responses: {
                    200: { description: 'Auction details', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuctionDetailsResponse' } } } },
                    404: { description: 'Auction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/auction/{auctionID}/bid': {
            post: {
                tags: ['Auction'],
                summary: 'Place a bid on an auction',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'auctionID',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'Auction ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/PlaceBidRequest' } },
                    },
                },
                responses: {
                    200: { description: 'Bid placed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlaceBidResponse' } } } },
                    400: { description: 'Invalid bid or auction timing', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Auction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
    },
};
// #endregion

// #region Swagger jsdoc opciók és specifikáció generálás
const swaggerOptions = {
    definition: swaggerDefinition,
    apis: [],
};
// #endregion

// #region Swagger specifikáció generálás
const swaggerSpec = swaggerJsdoc(swaggerOptions);
// #endregion

export default swaggerSpec;
