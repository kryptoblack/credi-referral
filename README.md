# CrediReferral

This NestJS project demonstrates the implementation of a simple referral system, 
allowing registered users to generate unique referral links. Each referral link 
includes a user-specific identifier and a 7-character hex code, ensuring 
uniqueness. The generated links can be shared, and users will receive credits 
when their friends install the application using these referral links.

## Features
- Referral Link Generation: Registered users can create unique referral links 
containing a user identifier and a UUID.
- Credit Rewards: Users receive credits in their wallet when friends install 
the application using their referral links.
- Link Expiry: Referral links expire after a certain number of uses 
(configurable).

## Installation

1. Clone the repository
```bash
# HTTPS
git clone https://github.com/yourusername/nestjs-referral-system.git

# SSH
git clone git@github.com:kryptoblack/credi-referral.git
```

2. Install dependencies
```bash
cd backend
pnpm install
```

3. Configure your environment variables with the help of `example.env`.
4. Run the application
```bash
pnpm start
```

## Usage

1. Visit the page on  `http://localhost:<APP_PORT>/api`
2. Create your user from `/register` endpoint
3. Use the currently created user to login with endpoint `/login`

## License

This project is licensed under the [GNU AFFERO License](./LICENSE).
