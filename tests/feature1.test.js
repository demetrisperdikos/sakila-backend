
const { screen, render } = require("@testing-library/react");
const fetchMock = require("jest-fetch-mock");
const db = require("./mockDb");  // Mock database


describe('Presentation Layer - Top 5 Rented Movies', () => {
  test('should display top 5 rented movies on landing page', async () => {
    render(<LandingPage />);
    
    const movies = await screen.findAllByTestId("topRentedMovies");
    
    expect(movies.length).toBe(5);
  });
});

describe('Business Logic Layer - Top 5 Rented Movies', () => {
  test('should fetch top 5 rented movies', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { id: 1, name: "Movie 1" },
      { id: 2, name: "Movie 2" },
      { id: 3, name: "Movie 3" },
      { id: 4, name: "Movie 4" },
      { id: 5, name: "Movie 5" }
    ]));
    
    const movies = await fetchTop5RentedMovies();
    
    expect(movies.length).toBe(5);
  });
});

describe('Data Access Layer - Top 5 Rented Movies', () => {
  test('should query top 5 rented movies', () => {
    db.query.mockResolvedValue([
      { id: 1, name: "Movie 1" },
      { id: 2, name: "Movie 2" },
      { id: 3, name: "Movie 3" },
      { id: 4, name: "Movie 4" },
      { id: 5, name: "Movie 5" }
    ]);
    
    const movies = db.query("SELECT * FROM movies ORDER BY rentals DESC LIMIT 5");
    
    expect(movies.length).toBe(5);
  });
});
