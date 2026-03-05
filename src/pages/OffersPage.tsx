import React, { useState } from 'react';
import { useStore, Offer } from '../context/StoreContext';
import { Plus, Trash2, Tag, Percent, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function OffersPage() {
  const { offers, addOffer, deleteOffer, menuItems } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Offer>>({
    name: '',
    description: '',
    discountPercentage: 0,
    applicableFoodIds: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOffer(formData as Omit<Offer, 'id'>);
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      discountPercentage: 0,
      applicableFoodIds: []
    });
  };

  const toggleFoodSelection = (foodId: string) => {
    setFormData(prev => {
      const current = prev.applicableFoodIds || [];
      if (current.includes(foodId)) {
        return { ...prev, applicableFoodIds: current.filter(id => id !== foodId) };
      } else {
        return { ...prev, applicableFoodIds: [...current, foodId] };
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Special Offers</h1>
          <p className="text-gray-500 mt-1">Create enticing deals for your customers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#c5a059] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b08d48] transition-colors flex items-center shadow-lg hover:shadow-xl transform active:scale-95 duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteOffer(offer.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#c5a059]/10 p-3 rounded-full text-[#c5a059]">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-[#0a192f] flex items-baseline">
                    {offer.discountPercentage}%
                    <span className="text-sm font-normal text-gray-400 ml-1">OFF</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#0a192f] mb-2">{offer.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{offer.description}</p>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicable Items</h4>
                  <div className="flex flex-wrap gap-2">
                    {offer.applicableFoodIds.slice(0, 3).map(id => {
                      const item = menuItems.find(i => i.id === id);
                      return item ? (
                        <span key={id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {item.name}
                        </span>
                      ) : null;
                    })}
                    {offer.applicableFoodIds.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        +{offer.applicableFoodIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {offers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No active offers</h3>
            <p className="text-gray-500 mt-1">Create your first offer to attract more customers.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="bg-[#0a192f] px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-serif text-xl font-bold">Create New Offer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                  placeholder="e.g., Summer Special"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                  rows={2}
                  placeholder="e.g., Get 20% off on all main courses"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({...formData, discountPercentage: parseInt(e.target.value)})}
                    className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                    required
                  />
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Applicable Items</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                  {menuItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleFoodSelection(item.id)}
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                        formData.applicableFoodIds?.includes(item.id)
                          ? "bg-[#c5a059]/10 border-[#c5a059] text-[#0a192f]"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="text-sm font-medium truncate mr-2">{item.name}</span>
                      {formData.applicableFoodIds?.includes(item.id) && (
                        <Check className="h-4 w-4 text-[#c5a059]" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select items to apply this offer to.</p>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0a192f] text-white hover:bg-[#152a45] transition-colors shadow-lg"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
