This project was created using [Create JD App](https://github.com/OrJDev/create-jd-app)

## Start Dev Server

```bash
yarn run dev
```

This will start a dev server on port `3000` and will watch for changes.

## Testing Production Build

### Build

```bash
yarn run build
```

### Start

```bash
yarn run start
```

This will start a production server on port `3000`.

## Deploying To Vercel

### Building

```bash
  vercel build --prod
```
  
### Deploying 

```bash
vercel deploy --prod --prebuilt
```
### Enviroment Variables

- `ENABLE_VC_BUILD`=1
- `DATABASE_URL`=file:./db.sqlite
- `UPSTASH_REDIS_REST_URL`=
- `UPSTASH_REDIS_REST_TOKEN`=  
  
[Sponsor Create JD App](https://github.com/sponsors/OrJDev)
