// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-4">Welcome to Agile Ticket Voter</h2>
    <p className="mb-6 text-gray-700">
      Collaboratively vote on your agile tickets. Create a new session or join an existing one to get started.
    </p>
    <div className="flex flex-col md:flex-row justify-center gap-4">
      <Link to="/create">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Create Session
        </button>
      </Link>
      <Link to="/join">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
          Join Session
        </button>
      </Link>
    </div>
  </div>
);

export default HomePage;
