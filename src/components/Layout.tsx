import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag, LogOut, Power, DollarSign, Armchair } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { clsx } from 'clsx';

export default function Layout() {
  const { logout, isRestaurantOpen, toggleRestaurantStatus } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/dashboard/transactions', label: 'Payouts', icon: DollarSign },
    { path: '/dashboard/dine-in', label: 'Dine-in', icon: Armchair },
    { path: '/dashboard/offers', label: 'Offers', icon: Tag },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a192f] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#c5a059] rounded-full mb-3 flex items-center justify-center">
            <span className="font-serif text-2xl font-bold text-[#0a192f]">S</span>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-[#c5a059]">The SparQ</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Fine-Dine</p>
          
          {/* Restaurant Status Toggle */}
          <div className="mt-6 w-full">
            <button
              onClick={toggleRestaurantStatus}
              className={clsx(
                "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-300 border",
                isRestaurantOpen 
                  ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20" 
                  : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              )}
            >
              <div className="flex items-center text-sm font-medium">
                <Power className="h-4 w-4 mr-2" />
                {isRestaurantOpen ? 'Open' : 'Closed'}
              </div>
              <div className={clsx(
                "w-8 h-4 rounded-full relative transition-colors duration-300",
                isRestaurantOpen ? "bg-green-500" : "bg-gray-600"
              )}>
                <div className={clsx(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm",
                  isRestaurantOpen ? "left-4.5" : "left-0.5"
                )} />
              </div>
            </button>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-[#c5a059] text-[#0a192f] shadow-lg"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={clsx("mr-3 h-5 w-5", isActive ? "text-[#0a192f]" : "text-gray-400 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
