# ferry.fyi

A better tracker for the Washington State Ferry System

## Setting up dev environment

1. Install [postgres](https://www.postgresql.org/)
2. Install [redis](https://redis.io/)
3. `git clone git@github.com:anstosa/ferry.fyi.git`
4. `cd ferry.fyi`
5. `npm install`
6. `cd .env.sample .env` and fill out `.env` file
7. `npm run migrate` to initialize database


## Running locally

1. `npm run client`
2. (in another terminal) `npm run worker`
3. (in another terminal) `npm run web`
4. http://localhost:4040

## Credits

Thank you to [![BookStack](https://user-images.githubusercontent.com/568242/60857158-6ad96100-a1be-11e9-9cdf-aa5872f2f6c5.png)](http://browserstack.com/) for providing free cross-browser testing.
