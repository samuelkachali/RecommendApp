// TMDB API Configuration
const API_KEY = 'fe038d7c82f30a8705d3933bf78e2181'; // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Theme Configuration
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

// DOM Elements
const movieGrid = document.getElementById('movie-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const resultsTitle = document.getElementById('results-title');
const loadingElement = document.getElementById('loading');
const loadMoreBtn = document.getElementById('load-more');
const featuredMovieCard = document.getElementById('featured-movie-card');
const featuredTitle = document.getElementById('featured-title');
const featuredOverview = document.getElementById('featured-overview');
const featuredYear = document.getElementById('featured-year');
const featuredRating = document.getElementById('featured-rating');
const featuredRuntime = document.getElementById('featured-runtime');
const watchTrailerBtn = document.getElementById('watch-trailer');
const linkedinLink = document.querySelector('.social-link.linkedin'); // Add this line

// App State
let currentPage = 1;
let totalPages = 1;
let currentMovies = [];
let currentQuery = '';
let currentGenre = '';
let featuredMovie = null;

// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedMovie();
    fetchPopularMovies();
    setupEventListeners();
    initTheme(); // Initialize theme on load
    
    // Set up LinkedIn link properly
    if (linkedinLink) {
        linkedinLink.href = 'https://www.linkedin.com/in/samuel-kachali-b37926254';
        linkedinLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(linkedinLink.href, '_blank');
        });
    }
});

function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', searchMovies);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMovies();
    });

    // Random movies
    randomBtn.addEventListener('click', fetchRandomMovies);
    
    // Theme toggle
    themeBtn.addEventListener('click', toggleTheme);

    // Genre buttons
    document.querySelectorAll('.genre-buttons button').forEach(button => {
        button.addEventListener('click', () => {
            currentGenre = button.dataset.genre;
            currentPage = 1;
            fetchMoviesByGenre(currentGenre, button.textContent);
        });
    });

    // Load more movies
    loadMoreBtn.addEventListener('click', loadMoreMovies);

    // Watch trailer
    watchTrailerBtn.addEventListener('click', () => {
        if (featuredMovie) {
            openTrailer(featuredMovie.id);
        }
    });
}

// Fetch and display today's featured movie
async function fetchFeaturedMovie() {
    try {
        // Get trending movies from today
        const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
        const data = await response.json();
        
        // Pick the first movie (most trending today)
        featuredMovie = data.results[0];
        
        // Get additional details including runtime
        const detailsResponse = await fetch(`${BASE_URL}/movie/${featuredMovie.id}?api_key=${API_KEY}`);
        const details = await detailsResponse.json();
        
        displayFeaturedMovie(details);
    } catch (error) {
        console.error('Error fetching featured movie:', error);
        featuredMovieCard.innerHTML = '<p>Failed to load featured movie</p>';
    }
}

function displayFeaturedMovie(movie) {
    featuredMovieCard.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${IMG_BASE_URL}${movie.backdrop_path || movie.poster_path})`;
    featuredTitle.textContent = movie.title;
    featuredOverview.textContent = movie.overview || 'No overview available.';
    featuredYear.textContent = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    featuredRating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    featuredRuntime.textContent = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
}

function openTrailer(movieId) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(featuredMovie.title)}+trailer`, '_blank');
}

// Fetch popular movies
async function fetchPopularMovies() {
    currentQuery = '';
    currentGenre = '';
    currentPage = 1;
    
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`);
        const data = await response.json();
        currentMovies = data.results;
        totalPages = data.total_pages;
        displayMovies(currentMovies);
        resultsTitle.textContent = 'Popular Movies';
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Display movies in the grid
function displayMovies(movies) {
    if (currentPage === 1) {
        movieGrid.innerHTML = '';
    }
    
    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = '<p class="no-results">No movies found. Try a different search.</p>';
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        const posterPath = movie.poster_path 
            ? `${IMG_BASE_URL}${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-details">
                    <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                    <span class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => {
            alert(`You clicked on ${movie.title}\n\nOverview:\n${movie.overview || 'No overview available.'}`);
        });
        
        movieGrid.appendChild(movieCard);
    });
}

// Search movies
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    currentQuery = query;
    currentGenre = '';
    currentPage = 1;
    
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${currentPage}`);
        const data = await response.json();
        currentMovies = data.results;
        totalPages = data.total_pages;
        displayMovies(currentMovies);
        resultsTitle.textContent = `Search Results for "${query}"`;
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error searching movies:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Get random movies
async function fetchRandomMovies() {
    showLoading();
    try {
        // Get a random page (1-5) to increase randomness
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${randomPage}`);
        const data = await response.json();
        
        // Get 6 random movies from the results
        const shuffled = data.results.sort(() => 0.5 - Math.random());
        currentMovies = shuffled.slice(0, 6);
        
        displayMovies(currentMovies);
        resultsTitle.textContent = 'Random Movie Picks';
        loadMoreBtn.style.display = 'none'; // Hide load more for random movies
    } catch (error) {
        console.error('Error fetching random movies:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Get movies by genre
async function fetchMoviesByGenre(genreId, genreName) {
    currentQuery = '';
    currentGenre = genreId;
    currentPage = 1;
    
    showLoading();
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${currentPage}`);
        const data = await response.json();
        currentMovies = data.results;
        totalPages = data.total_pages;
        displayMovies(currentMovies);
        resultsTitle.textContent = `${genreName} Movies`;
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Load more movies
async function loadMoreMovies() {
    if (currentPage >= totalPages) {
        loadMoreBtn.disabled = true;
        return;
    }
    
    currentPage++;
    showLoading();
    loadMoreBtn.disabled = true;
    
    try {
        let url;
        if (currentQuery) {
            url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        } else if (currentGenre) {
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenre}&sort_by=popularity.desc&page=${currentPage}`;
        } else {
            url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        currentMovies = [...currentMovies, ...data.results];
        displayMovies(data.results);
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error loading more movies:', error);
    } finally {
        hideLoading();
        loadMoreBtn.disabled = false;
    }
}

function updateLoadMoreButton() {
    loadMoreBtn.style.display = currentPage < totalPages ? 'block' : 'none';
}

// Helper functions
function showLoading() {
    loadingElement.style.display = 'flex';
    movieGrid.style.display = 'none';
}

function hideLoading() {
    loadingElement.style.display = 'none';
    movieGrid.style.display = 'grid';
}

function showError() {
    movieGrid.innerHTML = '<p class="error">Failed to load movies. Please try again later.</p>';
    movieGrid.style.display = 'block';
    loadMoreBtn.style.display = 'none';
}