import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppAccessGate } from './components/AppAccessGate';
import { AppLayout } from './components/AppLayout';
import { Home } from './pages/Home';
import { ChatPage } from './pages/ChatPage';
import { RecipeLibrary } from './pages/RecipeLibrary';
import { MealPlanner } from './pages/MealPlanner';
import { GroceryList } from './pages/GroceryList';

export function App() {
  return (
    <AppAccessGate>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/recipes" element={<RecipeLibrary />} />
            <Route path="/planning" element={<MealPlanner />} />
            <Route path="/grocery" element={<GroceryList />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppAccessGate>
  );
}
