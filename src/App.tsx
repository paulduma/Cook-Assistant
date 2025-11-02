import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { RecipeLibrary } from './pages/RecipeLibrary';
import { MealPlanner } from './pages/MealPlanner';
import { GroceryList } from './pages/GroceryList';
export function App() {
  return <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeLibrary />} />
          <Route path="/planner" element={<MealPlanner />} />
          <Route path="/grocery" element={<GroceryList />} />
        </Routes>
      </div>
    </BrowserRouter>;
}