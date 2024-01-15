# CrediReferral - Backend

This is built using [NestJS](https://nestjs.com/).

## Modules

### App

This is the root module in the dependency tree. Since we wanted to achieve 
login, register, and balance at root, so we have implemented `/api/login`, 
`/api/register`, and `/api/balance` in `app.controller.ts`.

### Auth

This module deals with everything that has to do with authentication and 
authorization. Even though, login and register endpoints are implemented in 
`app.controller.ts` their logically implementation can be found in 
`auth.service.ts`. This was done to adhere to Separation of Concern.

### Common

This module deals with any piece of code that are shared by all the other 
modules.

### Config

This module is responsible for handle the application configuration i.e. 
app and database configuration.

### Referral

This module handles everything to do with Referral. This module implements
`/api/referral/generate`, `/api/referral/verify`, and `/api/referral/expire`.

### Users

This module deals with all the User operation. It does not deals with controller
but rather the User entity and services.
