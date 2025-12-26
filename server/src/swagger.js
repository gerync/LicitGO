import swaggerJsdoc from 'swagger-jsdoc';
import configs from './configs/Configs.js';

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
    },
};

const swaggerOptions = {
    definition: swaggerDefinition,
    apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
