import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export type Category = 'Main Course' | 'Starter' | 'Dessert' | 'Beverage';
export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Completed' | 'Delivered' | 'Rejected';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type PaymentMethod = 'Cash' | 'Card' | 'Online' | 'COD';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  isVeg: boolean;
  isAvailable: boolean;
  images: string[]; // Array of image URLs
  primaryImageIndex: number;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  applicableFoodIds: string[];
}

export interface OrderItem {
  foodId: string;
  quantity: number;
  name: string; // Snapshot of name at time of order
  price: number; // Snapshot of price at time of order
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string; // Optional
  customerPhone: string; // Optional
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  estimatedTime?: string;
  rejectionReason?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  history: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface TableSlot {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // in hours, default 1
  guests: number;
  tableId?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: string;
  specialRequests?: string;
  dietaryRestrictions?: string;
}

export interface RestaurantSettings {
  openingTime: string; // HH:mm
  closingTime: string; // HH:mm
}

interface StoreContextType {
  user: { email: string } | null;
  login: (email: string) => void;
  logout: () => void;
  
  menuItems: FoodItem[];
  addMenuItem: (item: Omit<FoodItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<FoodItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => void;
  deleteOffer: (id: string) => void;
  
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus, additionalData?: { estimatedTime?: string; rejectionReason?: string; paymentStatus?: PaymentStatus; paymentMethod?: PaymentMethod }) => void;
  
  isRestaurantOpen: boolean;
  toggleRestaurantStatus: () => void;

  tableSlots: TableSlot[];
  addTableSlot: (slot: Omit<TableSlot, 'id'>) => void;
  updateTableSlot: (id: string, slot: Partial<TableSlot>) => void;
  deleteTableSlot: (id: string) => void;

  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;

  restaurantSettings: RestaurantSettings;
  updateRestaurantSettings: (settings: Partial<RestaurantSettings>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data
const INITIAL_TABLE_SLOTS: TableSlot[] = [
  { id: '1', name: 'Table 1', capacity: 4, isAvailable: true },
  { id: '2', name: 'Table 2', capacity: 2, isAvailable: true },
  { id: '3', name: 'Booth A', capacity: 6, isAvailable: false },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    customerName: 'Alice Johnson',
    customerPhone: '555-0101',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    duration: 1,
    guests: 4,
    status: 'Pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    specialRequests: 'Quiet table preferred, celebrating anniversary.',
    dietaryRestrictions: 'Gluten-free options needed for one guest.'
  }
];

const INITIAL_SETTINGS: RestaurantSettings = {
  openingTime: '11:00',
  closingTime: '23:00'
};

const INITIAL_MENU: FoodItem[] = [
  {
    id: '1',
    name: 'Truffle Risotto',
    description: 'Creamy arborio rice with black truffle shavings and parmesan crisp.',
    price: 24.00,
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0
  },
  {
    id: '2',
    name: 'Wagyu Beef Burger',
    description: 'Premium wagyu beef patty, caramelized onions, gruyere cheese, truffle mayo.',
    price: 32.00,
    category: 'Main Course',
    isVeg: false,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan cheese, croutons, and classic caesar dressing.',
    price: 14.00,
    category: 'Starter',
    isVeg: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0
  },
  {
    id: '4',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.',
    price: 12.00,
    category: 'Dessert',
    isVeg: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0
  },
  {
    id: '5',
    name: 'Mojito',
    description: 'Refreshing cocktail with white rum, sugar, lime juice, soda water, and mint.',
    price: 10.00,
    category: 'Beverage',
    isVeg: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800'],
    primaryImageIndex: 0
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '555-0123',
    items: [
      { foodId: '1', quantity: 1, name: 'Truffle Risotto', price: 24.00 },
      { foodId: '3', quantity: 2, name: 'Caesar Salad', price: 14.00 }
    ],
    totalAmount: 52.00,
    status: 'Pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    paymentStatus: 'Pending',
    paymentMethod: 'COD',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), note: 'Order placed' }
    ]
  },
  {
    id: 'ord-124',
    customerName: 'Alice Smith',
    customerEmail: 'alice@example.com',
    customerPhone: '555-0124',
    items: [
      { foodId: '2', quantity: 2, name: 'Wagyu Beef Burger', price: 32.00 }
    ],
    totalAmount: 64.00,
    status: 'Accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    estimatedTime: '45 mins',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), note: 'Order placed' },
      { status: 'Accepted', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), note: 'Order accepted. Estimated time: 45 mins' }
    ]
  },
  {
    id: 'ord-125',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    customerPhone: '555-0125',
    items: [
      { foodId: '4', quantity: 1, name: 'Tiramisu', price: 12.00 },
      { foodId: '5', quantity: 2, name: 'Mojito', price: 10.00 }
    ],
    totalAmount: 32.00,
    status: 'Preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    estimatedTime: '20 mins',
    paymentStatus: 'Paid',
    paymentMethod: 'Online',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), note: 'Order placed' },
      { status: 'Accepted', timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(), note: 'Order accepted. Estimated time: 20 mins' },
      { status: 'Preparing', timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(), note: 'Kitchen started preparing' }
    ]
  },
  {
    id: 'ord-126',
    customerName: 'Emma Davis',
    customerEmail: 'emma@example.com',
    customerPhone: '555-0126',
    items: [
      { foodId: '3', quantity: 1, name: 'Caesar Salad', price: 14.00 }
    ],
    totalAmount: 14.00,
    status: 'Completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    estimatedTime: '15 mins',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), note: 'Order placed' },
      { status: 'Accepted', timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(), note: 'Order accepted. Estimated time: 15 mins' },
      { status: 'Preparing', timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(), note: 'Kitchen started preparing' },
      { status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), note: 'Order ready for pickup/delivery' }
    ]
  },
  {
    id: 'ord-127',
    customerName: 'Michael Wilson',
    customerEmail: 'michael@example.com',
    customerPhone: '555-0127',
    items: [
      { foodId: '2', quantity: 1, name: 'Wagyu Beef Burger', price: 32.00 },
      { foodId: '5', quantity: 1, name: 'Mojito', price: 10.00 }
    ],
    totalAmount: 42.00,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    estimatedTime: '30 mins',
    paymentStatus: 'Paid',
    paymentMethod: 'Online',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), note: 'Order placed' },
      { status: 'Accepted', timestamp: new Date(Date.now() - 1000 * 60 * 175).toISOString(), note: 'Order accepted. Estimated time: 30 mins' },
      { status: 'Preparing', timestamp: new Date(Date.now() - 1000 * 60 * 170).toISOString(), note: 'Kitchen started preparing' },
      { status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(), note: 'Order ready' },
      { status: 'Delivered', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), note: 'Order delivered to customer' }
    ]
  },
  {
    id: 'ord-128',
    customerName: 'Sarah Brown',
    customerEmail: 'sarah@example.com',
    customerPhone: '555-0128',
    items: [
      { foodId: '1', quantity: 2, name: 'Truffle Risotto', price: 24.00 }
    ],
    totalAmount: 48.00,
    status: 'Rejected',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    rejectionReason: 'Kitchen closed due to maintenance',
    paymentStatus: 'Failed',
    paymentMethod: 'Online',
    history: [
      { status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), note: 'Order placed' },
      { status: 'Rejected', timestamp: new Date(Date.now() - 1000 * 60 * 235).toISOString(), note: 'Order rejected: Kitchen closed due to maintenance' }
    ]
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>(INITIAL_MENU);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [tableSlots, setTableSlots] = useState<TableSlot[]>(INITIAL_TABLE_SLOTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);

  // Load from localStorage on mount (optional, skipping for simplicity/mock data focus)
  
  const login = (email: string) => setUser({ email });
  const logout = () => setUser(null);
  
  const toggleRestaurantStatus = () => setIsRestaurantOpen(prev => !prev);

  const addMenuItem = (item: Omit<FoodItem, 'id'>) => {
    setMenuItems(prev => [...prev, { ...item, id: uuidv4() }]);
  };

  const updateMenuItem = (id: string, updates: Partial<FoodItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const addOffer = (offer: Omit<Offer, 'id'>) => {
    setOffers(prev => [...prev, { ...offer, id: uuidv4() }]);
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(item => item.id !== id));
  };

  const addTableSlot = (slot: Omit<TableSlot, 'id'>) => {
    setTableSlots(prev => [...prev, { ...slot, id: uuidv4() }]);
  };

  const updateTableSlot = (id: string, updates: Partial<TableSlot>) => {
    setTableSlots(prev => prev.map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  const deleteTableSlot = (id: string) => {
    setTableSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const addReservation = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    setReservations(prev => [...prev, {
      ...reservation,
      id: uuidv4(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    }]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => res.id === id ? { ...res, ...updates } : res));
  };

  const updateRestaurantSettings = (settings: Partial<RestaurantSettings>) => {
    setRestaurantSettings(prev => ({ ...prev, ...settings }));
  };

  const updateOrderStatus = (id: string, status: OrderStatus, additionalData?: { estimatedTime?: string; rejectionReason?: string; paymentStatus?: PaymentStatus; paymentMethod?: PaymentMethod }) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const note = additionalData?.rejectionReason 
          ? `Order rejected: ${additionalData.rejectionReason}`
          : additionalData?.estimatedTime 
            ? `Order accepted. Estimated time: ${additionalData.estimatedTime}`
            : `Status updated to ${status}`;
            
        return {
          ...order,
          status,
          ...additionalData,
          history: [
            ...order.history,
            {
              status,
              timestamp: new Date().toISOString(),
              note: additionalData?.paymentStatus === 'Paid' ? `${note}. Payment received (Cash)` : note
            }
          ]
        };
      }
      return order;
    }));
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout,
      menuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      offers, addOffer, deleteOffer,
      orders, updateOrderStatus,
      isRestaurantOpen, toggleRestaurantStatus,
      tableSlots, addTableSlot, updateTableSlot, deleteTableSlot,
      reservations, addReservation, updateReservation,
      restaurantSettings, updateRestaurantSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
