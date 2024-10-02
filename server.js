const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS to allow requests from your frontend
app.use(cors());

// News API endpoint
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const API_KEY = process.env.API_KEY;

// Function to recursively fetch all news pages
const fetchAllNews = async (category, country = 'us', page = 1, pageSize = 100, accumulatedArticles = []) => {
  const response = await axios.get(NEWS_API_URL, {
    params: {
      country: country,
      apiKey: API_KEY,
      category: category || '',
      page: page,
      pageSize: pageSize,
    },
  });

  const articles = response.data.articles;
  const totalResults = response.data.totalResults;

  // Combine current page's articles with the accumulated articles
  accumulatedArticles = [...accumulatedArticles, ...articles];

  // If there are more articles to fetch, recursively call fetchAllNews
  const totalPages = Math.ceil(totalResults / pageSize);
  if (page < totalPages) {
    return await fetchAllNews(category, country, page + 1, pageSize, accumulatedArticles);
  }

  return accumulatedArticles;
};

// Endpoint to fetch all news
app.get('/api/news', async (req, res) => {
  try {
    const { category, country = 'us' } = req.query;

    // Fetch all news (by recursively fetching all pages)
    const allArticles = await fetchAllNews(category, country);

    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
