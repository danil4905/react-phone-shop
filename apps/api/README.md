# Phone Shop API

## Quick start

1. Install dependencies from the repo root:

```bash
npm install
```

2. Seed demo data (500 phones, 15 brands):

```bash
npm run --prefix apps/api seed
```

3. Start the API:

```bash
npm run --prefix apps/api dev
```

API runs on `http://localhost:4000`.

## Import real phones dataset (2025)

1. Download the CSV dataset and save it to:

```
apps/api/data/mobiles-2025.csv
```

2. Run the importer:

```bash
npm run --prefix apps/api import:2025
```

This will overwrite `brands.json`, `categories.json`, and `phones.json`.
