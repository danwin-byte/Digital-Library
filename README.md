# Cream Shelf

A cream & beige bookshelf web app. Books stand on shelves as spines; click one to see its title, author, genre and a short description. Data lives in MongoDB.

**Stack:** Node.js · Express · Mongoose · MongoDB · vanilla HTML/CSS/JS

## Run it

1. Install Node 18+ and MongoDB (local) or create a free MongoDB Atlas cluster.
2. In this folder:
   ```bash
   npm install
   cp .env.example .env      # edit MONGO_URI if needed
   npm run seed              # loads 36 sample books
   npm start                 # http://localhost:3000
   ```

MongoDB via Docker, if you don't want to install it:
```bash
docker run -d --name shelf-mongo -p 27017:27017 mongo:7
```

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/books?q=&genre=` | List / search books |
| GET | `/api/shelves?by=genre\|author\|status\|year` | Books grouped into shelves |
| GET | `/api/books/:id` | One book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Remove a book |

## Customising

- Colours: CSS variables at the top of `public/style.css` (`--cream`, `--beige`, `--wood`, `--accent`).
- Spine colours: `PALETTE` array in `public/app.js`.
- Your own books: edit the array in `seed.js` and re-run `npm run seed`, or use the "+ Add book" button.
