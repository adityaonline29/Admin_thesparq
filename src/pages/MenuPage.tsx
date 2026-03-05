import React, { useState } from 'react';
import { useStore, FoodItem, Category } from '../context/StoreContext';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  // Form State
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
    images: [],
    primaryImageIndex: 0
  });

  const categories: Category[] = ['Main Course', 'Starter', 'Dessert', 'Beverage'];

  const handleOpenModal = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        images: [],
        primaryImageIndex: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMenuItem(editingItem.id, formData);
    } else {
      addMenuItem(formData as Omit<FoodItem, 'id'>);
    }
    setIsModalOpen(false);
  };

  const updateImages = (newImages: string[]) => {
    if (newImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let processedCount = 0;
    const MAX_SIZE_MB = 10;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 300;

    Array.from(files).forEach((file: File) => {
      // 1. Check File Size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
        processedCount++;
        if (processedCount === files.length) {
           updateImages(newImages);
        }
        return;
      }

      // 2. Check File Type
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File "${file.name}" is not a supported image type. Allowed: JPG, PNG, GIF, WebP.`);
        processedCount++;
        if (processedCount === files.length) {
           updateImages(newImages);
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const img = new Image();
          img.onload = () => {
             // 3. Check Resolution
             if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
               alert(`Image "${file.name}" is too small. Minimum resolution is ${MIN_WIDTH}x${MIN_HEIGHT}px.`);
             } else {
               newImages.push(reader.result as string);
             }
             
             processedCount++;
             if (processedCount === files.length) {
               updateImages(newImages);
             }
          };
          img.onerror = () => {
            alert(`Failed to load image "${file.name}".`);
            processedCount++;
            if (processedCount === files.length) {
               updateImages(newImages);
            }
          };
          img.src = reader.result as string;
        } else {
           processedCount++;
           if (processedCount === files.length) {
              updateImages(newImages);
           }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Menu Management</h1>
          <p className="text-gray-500 mt-1">Curate your culinary offerings</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#c5a059] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b08d48] transition-colors flex items-center shadow-lg hover:shadow-xl transform active:scale-95 duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Dish
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            activeCategory === 'All'
              ? "bg-[#0a192f] text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeCategory === cat
                ? "bg-[#0a192f] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group"
            >
              <div className="relative h-48 bg-gray-200 group">
                {item.images.length > 0 ? (
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {item.images.map((img, idx) => (
                      <div key={idx} className="w-full flex-shrink-0 snap-center h-full relative">
                        <img 
                          src={img} 
                          alt={`${item.name} ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                
                {/* Multiple Images Indicator */}
                {item.images.length > 1 && (
                   <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full pointer-events-none z-10 flex items-center shadow-sm">
                     <ImageIcon className="h-3 w-3 mr-1" />
                     {item.images.length}
                   </div>
                )}

                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                    item.isVeg ? "bg-green-100/90 text-green-800" : "bg-red-100/90 text-red-800"
                  )}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none z-10">
                   <h3 className="text-white font-serif text-xl font-bold">{item.name}</h3>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.category}</span>
                  <span className="text-lg font-bold text-[#c5a059]">${item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">{item.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                      className={clsx(
                        "flex items-center text-xs font-medium px-2 py-1 rounded transition-colors",
                        item.isAvailable ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-red-600 bg-red-50 hover:bg-red-100"
                      )}
                    >
                      {item.isAvailable ? <ToggleRight className="mr-1 h-4 w-4" /> : <ToggleLeft className="mr-1 h-4 w-4" />}
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-gray-400 hover:text-[#0a192f] hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
              <h2 className="text-white font-serif text-xl font-bold">
                {editingItem ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Images</label>
                  
                  {/* File Upload Area */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#c5a059] transition-colors cursor-pointer relative group bg-gray-50 hover:bg-gray-100">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                    />
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#c5a059] transition-colors" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#c5a059] hover:text-[#b08d48]">
                          Upload files
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Or add via URL</label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setFormData(prev => ({...prev, images: [...(prev.images || []), val]}));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="bg-gray-100 px-4 rounded-lg text-gray-600 hover:bg-gray-200 text-sm font-medium"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input.value) {
                            setFormData(prev => ({...prev, images: [...(prev.images || []), input.value]}));
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Image Previews */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group border border-gray-200 shadow-sm">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        
                        {idx === formData.primaryImageIndex ? (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#c5a059] text-white text-[10px] font-bold text-center py-1 z-10">
                            Primary
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, primaryImageIndex: idx}))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-8 col-span-2 bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={clsx(
                      "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                      formData.isVeg ? "bg-green-500 border-green-600" : "bg-white border-gray-300"
                    )}>
                      {formData.isVeg && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isVeg}
                      onChange={e => setFormData({...formData, isVeg: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={clsx(
                      "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                      formData.isAvailable ? "bg-[#0a192f] border-[#0a192f]" : "bg-white border-gray-300"
                    )}>
                      {formData.isAvailable && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isAvailable}
                      onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Available for Order</span>
                  </label>
                </div>
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
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
