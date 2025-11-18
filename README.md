# DfE Sign-in Applications

**DfE Sign-in Applications** provides an API used to retrieve client-application information from the Organisations database and manage relying-party application records. This service is part of the wider **login.dfe** project.

## Getting Started

### Install Dependencies

```
npm install
```

### Run application

Start the application with:

```
npm run dev
```

Once the service is running, to test the API locally:

```
curl https://localhost:44380/services
```

When deployed to an environment, a bearer token is required. The token can be generated with https://github.com/DFE-Digital/login.dfe.jwt-strategies. Once you have the token you can append it to the curl command in the following way:

```
curl https://<host>/services --header 'Authorization: Bearer <bearer token here>'
```

### Run Tests

Run all tests with:

```
npm run test
```

### Code Quality and Formatting

Run ESLint:

```
npm run lint
```

Automatically fix lint issues:

```
npm run lint:fix
```

### Development Checks

Run linting and tests together:

```
npm run dev:checks
```

### Pre-commit Hooks

Pre-commit hooks are handled automatically via Husky. No additional setup is required.
