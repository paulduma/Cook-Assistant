import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHatIcon, HomeIcon, BookOpenIcon, CalendarIcon, ShoppingCartIcon } from 'lucide-react';
export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const navItems = [{
    path: '/',
    label: 'Home',
    icon: HomeIcon
  }, {
    path: '/recipes',
    label: 'Recipes',
    icon: BookOpenIcon
  }, {
    path: '/planner',
    label: 'Meal Planner',
    icon: CalendarIcon
  }, {
    path: '/grocery',
    label: 'Grocery List',
    icon: ShoppingCartIcon
  }];
  return <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ChefHatIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-emerald-600">
              MealPlanner
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>;
          })}
          </div>
        </div>
      </div>
    </nav>;
}