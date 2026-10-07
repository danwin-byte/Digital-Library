require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cream_shelf";

// Descriptions are short, original summaries.
const books = [
  // Fantasy
  { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, pages: 310, status: "Read", rating: 5,
    description: "A comfort-loving hobbit is swept into a dwarf expedition to reclaim a mountain from a dragon, and finds unexpected courage along the way." },
  { title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", genre: "Fantasy", year: 1968, pages: 183, status: "Read", rating: 5,
    description: "A gifted but proud young mage releases a shadow into the world and must chase it across a sea of islands to set things right." },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", year: 2007, pages: 662, status: "Reading", rating: 4,
    description: "An innkeeper with a hidden past tells the story of his youth as a prodigy, a performer, and a student at a school of arcane arts." },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", genre: "Fantasy", year: 2006, pages: 541, status: "Want to read", rating: 0,
    description: "A street thief discovers she can burn metals for power and joins a crew plotting to topple an immortal ruler." },
  { title: "Piranesi", author: "Susanna Clarke", genre: "Fantasy", year: 2020, pages: 272, status: "Read", rating: 5,
    description: "A man lives contentedly in an endless house of statues and tides, until signs appear that he is not alone." },

  // Science Fiction
  { title: "Dune", author: "Frank Herbert", genre: "Science Fiction", year: 1965, pages: 412, status: "Read", rating: 5,
    description: "On a desert planet that holds the galaxy's most precious resource, a noble family's fall sets a young heir on a path to destiny." },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Science Fiction", year: 1969, pages: 304, status: "Read", rating: 4,
    description: "An envoy visits a frozen world whose people have no fixed gender, and learns about trust, politics, and friendship." },
  { title: "Project Hail Mary", author: "Andy Weir", genre: "Science Fiction", year: 2021, pages: 476, status: "Read", rating: 5,
    description: "A teacher wakes alone on a spaceship with no memory and slowly realizes he is humanity's last hope." },
  { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction", year: 1984, pages: 271, status: "Want to read", rating: 0,
    description: "A washed-up hacker is pulled into one last job inside a neon-lit digital underworld." },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", genre: "Science Fiction", year: 2021, pages: 303, status: "Want to read", rating: 0,
    description: "A solar-powered artificial friend observes the human world with quiet devotion from a shop window and a family home." },

  // Mystery
  { title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery", year: 1939, pages: 272, status: "Read", rating: 5,
    description: "Ten strangers on an isolated island are accused of past crimes, and then they begin to die one by one." },
  { title: "The Big Sleep", author: "Raymond Chandler", genre: "Mystery", year: 1939, pages: 231, status: "Want to read", rating: 0,
    description: "A weary private detective takes a blackmail case for a wealthy family and uncovers far more than he was hired to find." },
  { title: "The Thursday Murder Club", author: "Richard Osman", genre: "Mystery", year: 2020, pages: 382, status: "Read", rating: 4,
    description: "Four retirees who meet weekly to study cold cases suddenly find a real murder on their doorstep." },
  { title: "In the Woods", author: "Tana French", genre: "Mystery", year: 2007, pages: 429, status: "Want to read", rating: 0,
    description: "A detective haunted by a childhood disappearance investigates a murder in the same Irish woodland." },

  // Classics
  { title: "Pride and Prejudice", author: "Jane Austen", genre: "Classics", year: 1813, pages: 279, status: "Read", rating: 5,
    description: "Sharp-witted Elizabeth Bennet and the proud Mr. Darcy must overcome first impressions in a society ruled by rank and marriage." },
  { title: "Jane Eyre", author: "Charlotte Brontë", genre: "Classics", year: 1847, pages: 532, status: "Read", rating: 4,
    description: "An orphaned governess finds love and a dark secret at a brooding English manor." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classics", year: 1960, pages: 336, status: "Read", rating: 5,
    description: "In a sleepy Southern town, a girl watches her father defend a wrongly accused man and learns hard lessons about justice." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classics", year: 1925, pages: 180, status: "Read", rating: 4,
    description: "A mysterious millionaire throws lavish parties in pursuit of a lost love in Jazz Age Long Island." },
  { title: "Frankenstein", author: "Mary Shelley", genre: "Classics", year: 1818, pages: 280, status: "Want to read", rating: 0,
    description: "A young scientist creates life and then recoils from his creation, with tragic consequences for them both." },

  // Literary Fiction
  { title: "The Remains of the Day", author: "Kazuo Ishiguro", genre: "Literary Fiction", year: 1989, pages: 258, status: "Read", rating: 5,
    description: "An aging butler reflects on a life of dutiful service and the quiet things he never said." },
  { title: "Normal People", author: "Sally Rooney", genre: "Literary Fiction", year: 2018, pages: 266, status: "Read", rating: 4,
    description: "Two Irish teenagers drift together and apart through school and university, never quite saying what they mean." },
  { title: "A Little Life", author: "Hanya Yanagihara", genre: "Literary Fiction", year: 2015, pages: 720, status: "Want to read", rating: 0,
    description: "Four friends in New York grow up and grow older, and one man's buried past reshapes all of their lives." },
  { title: "The Song of Achilles", author: "Madeline Miller", genre: "Literary Fiction", year: 2011, pages: 378, status: "Read", rating: 5,
    description: "The tale of Achilles and Patroclus, retold as a tender love story set against the Trojan War." },

  // Non-Fiction
  { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", year: 2011, pages: 443, status: "Read", rating: 4,
    description: "A sweeping history of our species, from early foragers to the age of technology and global empires." },
  { title: "Atomic Habits", author: "James Clear", genre: "Non-Fiction", year: 2018, pages: 320, status: "Read", rating: 4,
    description: "A practical guide to building good routines through small changes that compound over time." },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", genre: "Non-Fiction", year: 2010, pages: 381, status: "Want to read", rating: 0,
    description: "The story of a woman whose cells transformed medicine, and of the family who was never told." },
  { title: "Educated", author: "Tara Westover", genre: "Non-Fiction", year: 2018, pages: 334, status: "Read", rating: 5,
    description: "A memoir of growing up in an isolated survivalist family and finding a way into the classroom." },
  { title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", genre: "Non-Fiction", year: 2013, pages: 391, status: "Reading", rating: 5,
    description: "A botanist weaves Indigenous wisdom and scientific insight into reflections on our relationship with the living world." },

  // Romance
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", genre: "Romance", year: 2017, pages: 389, status: "Read", rating: 5,
    description: "A reclusive Hollywood icon finally tells a young journalist the story of her glamorous, scandalous life and loves." },
  { title: "Beach Read", author: "Emily Henry", genre: "Romance", year: 2020, pages: 361, status: "Read", rating: 4,
    description: "Two rival writers swap genres for a summer and discover more about each other than their books." },
  { title: "The Hating Game", author: "Sally Thorne", genre: "Romance", year: 2016, pages: 384, status: "Want to read", rating: 0,
    description: "Two office rivals trade barbs and glares until the line between hate and something else begins to blur." },

  // Historical Fiction
  { title: "All the Light We Cannot See", author: "Anthony Doerr", genre: "Historical Fiction", year: 2014, pages: 531, status: "Read", rating: 5,
    description: "A blind French girl and a German radio-obsessed boy move toward each other through the turmoil of World War II." },
  { title: "Wolf Hall", author: "Hilary Mantel", genre: "Historical Fiction", year: 2009, pages: 604, status: "Want to read", rating: 0,
    description: "The rise of Thomas Cromwell through the dangerous court of Henry VIII, seen from close behind his shoulder." },
  { title: "The Book Thief", author: "Markus Zusak", genre: "Historical Fiction", year: 2005, pages: 552, status: "Read", rating: 5,
    description: "Narrated by Death, the story of a girl in Nazi Germany who steals books and shares them in a basement." },

  // Thriller
  { title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", year: 2012, pages: 415, status: "Read", rating: 4,
    description: "On their anniversary, a wife vanishes, and the husband's story and the diary she left behind begin to clash." },
  { title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", year: 2019, pages: 336, status: "Want to read", rating: 0,
    description: "A painter shoots her husband and never speaks again, until a therapist becomes obsessed with her silence." },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Thriller", year: 2005, pages: 465, status: "Read", rating: 4,
    description: "A disgraced journalist and a brilliant hacker investigate a decades-old disappearance inside a powerful family." },
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Book.deleteMany({});
    const docs = await Book.insertMany(books);
    console.log(`Seeded ${docs.length} books into ${mongoose.connection.name}`);
  } catch (e) {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
