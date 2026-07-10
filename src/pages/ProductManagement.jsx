import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaCheck, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding, product object if editing

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  // Supplements dynamic fields
  const [packSizes, setPackSizes] = useState([]); // [{ size: '', price: 0 }]
  const [newSize, setNewSize] = useState('');
  const [newSizePrice, setNewSizePrice] = useState(0);

  const [flavors, setFlavors] = useState([]); // ['Chocolate', 'Vanilla']
  const [newFlavor, setNewFlavor] = useState('');

  // Filter products for display
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Open modal for new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Food');
    setPrice(0);
    setDescription('');
    setActive(true);
    setPackSizes([]);
    setFlavors([]);
    setNewSize('');
    setNewSizePrice(0);
    setNewFlavor('');
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setDescription(product.description || '');
    setActive(product.active);
    setPackSizes(product.packSizes ? [...product.packSizes] : []);
    setFlavors(product.flavors ? [...product.flavors] : []);
    setNewSize('');
    setNewSizePrice(0);
    setNewFlavor('');
    setIsModalOpen(true);
  };

  // Add Pack Size variant
  const handleAddPackSize = () => {
    if (!newSize.trim()) {
      toast.error('Enter a pack size (e.g. 500g)');
      return;
    }
    if (newSizePrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (packSizes.some(s => s.size.toLowerCase() === newSize.trim().toLowerCase())) {
      toast.error('Size already exists');
      return;
    }

    setPackSizes([...packSizes, { size: newSize.trim(), price: newSizePrice }]);
    setNewSize('');
    setNewSizePrice(0);
  };

  // Remove Pack Size variant
  const handleRemovePackSize = (index) => {
    setPackSizes(packSizes.filter((_, idx) => idx !== index));
  };

  // Add Flavor variant
  const handleAddFlavor = () => {
    if (!newFlavor.trim()) {
      toast.error('Enter a flavor (e.g. Chocolate)');
      return;
    }
    if (flavors.some(f => f.toLowerCase() === newFlavor.trim().toLowerCase())) {
      toast.error('Flavor already exists');
      return;
    }

    setFlavors([...flavors, newFlavor.trim()]);
    setNewFlavor('');
  };

  // Remove Flavor variant
  const handleRemoveFlavor = (index) => {
    setFlavors(flavors.filter((_, idx) => idx !== index));
  };

  // Submit product Form
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (category === 'Supplement') {
      if (packSizes.length === 0) {
        toast.error('Please add at least one pack size & price for supplements');
        return;
      }
      if (flavors.length === 0) {
        toast.error('Please add at least one flavor for supplements');
        return;
      }
    } else {
      if (price <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }
    }

    const productPayload = {
      name: name.trim(),
      category,
      price: category === 'Food' ? price : packSizes[0].price,
      description: description.trim(),
      active,
      packSizes: category === 'Supplement' ? packSizes : [],
      flavors: category === 'Supplement' ? flavors : []
    };

    let success = false;
    if (editingProduct) {
      success = await updateProduct(editingProduct._id, productPayload);
    } else {
      success = await addProduct(productPayload);
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Toggle active/inactive status quickly from list
  const handleToggleActive = async (product) => {
    await updateProduct(product._id, {
      ...product,
      active: !product.active
    });
  };

  return (
    <div className="space-y-6 text-primaryTxt">
      {/* Top Banner and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-cardBg border border-borderCol rounded-3xl p-6 shadow-sm gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-primaryTxt md:text-2xl">Products Management</h2>
          <p className="text-xs text-secondaryTxt">Add, edit, or configure food items and gym supplement configurations.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg text-xs font-black rounded-xl shadow-lg shadow-emeraldGreen/10 flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <FaPlus />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-mutedTxt">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name/description..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
          {['All', 'Food', 'Supplement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-emeraldGreen text-whiteBg shadow-md shadow-emeraldGreen/10'
                  : 'text-secondaryTxt bg-whiteBg border border-borderCol hover:bg-lightgraySec'
              }`}
            >
              {cat === 'All' ? 'All Products' : cat === 'Supplement' ? 'Supplements' : 'Food'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm">
        <div className="overflow-x-auto w-full -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-borderCol text-secondaryTxt font-semibold bg-lightgraySec/50">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-4">Base Price / Starting Price</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderCol/60 text-primaryTxt">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-lightgraySec/30">
                    <td className="py-3 px-4 font-bold text-primaryTxt text-sm">
                      {p.name}
                      {p.category === 'Supplement' && p.packSizes && p.packSizes.length > 0 && (
                        <div className="text-[10px] text-purple-650 font-bold mt-1 flex flex-wrap gap-1">
                          {p.packSizes.map(v => (
                            <span key={v.size} className="bg-purple-50 border border-purple-200/50 px-1.5 py-0.5 rounded-md">
                              {v.size}: ₹{v.price}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.category === 'Supplement' && p.flavors && p.flavors.length > 0 && (
                        <div className="text-[10px] text-secondaryTxt font-semibold mt-1 flex flex-wrap gap-1">
                          <span>Flavors:</span>
                          {p.flavors.map(f => (
                            <span key={f} className="text-primaryTxt">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                        p.category === 'Supplement'
                          ? 'bg-purple-50 text-purple-650'
                          : 'bg-emerald-50 text-emeraldGreen'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-primaryTxt text-sm">
                      ₹{p.price}
                    </td>
                    <td className="py-3 px-4 text-secondaryTxt max-w-xs truncate">
                      {p.description || <span className="text-mutedTxt italic">No description</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`text-lg transition-colors duration-200 inline-flex items-center justify-center ${
                          p.active ? 'text-emeraldGreen' : 'text-slate-400'
                        }`}
                        title={p.active ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                      >
                        {p.active ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 bg-lightgraySec hover:bg-emeraldGreen hover:text-whiteBg rounded-xl text-secondaryTxt transition-colors border border-borderCol/40"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${p.name}"? This cannot be undone.`)) {
                              deleteProduct(p._id);
                            }
                          }}
                          className="p-2 bg-lightgraySec hover:bg-red-500 hover:text-white rounded-xl text-secondaryTxt transition-colors border border-borderCol/40"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-secondaryTxt text-sm">
                    No products added yet or none match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-darknavy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cardBg border border-borderCol rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8 text-primaryTxt">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-secondaryTxt hover:text-primaryTxt"
            >
              <FaTimes />
            </button>
            
            <h4 className="text-lg font-extrabold text-primaryTxt border-b border-borderCol pb-3 mb-4">
              {editingProduct ? 'Edit Product Configuration' : 'Create New Product'}
            </h4>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              {/* Product Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">Product Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Food', 'Supplement'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={!!editingProduct} // Disable category change when editing
                      onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        category === cat
                          ? 'bg-emeraldGreen text-whiteBg font-black shadow-md'
                          : 'text-secondaryTxt bg-whiteBg border border-borderCol'
                      } ${editingProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cat === 'Supplement' ? 'Gym Supplement' : 'Food Item'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Milk Oats Bowl, Whey Protein, etc."
                  className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2.5 px-3.5 text-primaryTxt"
                />
              </div>

              {/* Simple Price (For Food Only) */}
              {category === 'Food' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2.5 px-3.5 text-primaryTxt font-bold"
                  />
                </div>
              )}

              {/* Gym Supplement Configuration Area */}
              {category === 'Supplement' && (
                <div className="space-y-4 border-t border-borderCol pt-4">
                  <span className="text-[11px] text-emeraldGreen font-extrabold uppercase tracking-wide block">
                    Supplement Specifications
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pack Sizes & Prices list */}
                    <div className="bg-lightgraySec/50 p-4 rounded-2xl border border-borderCol space-y-3">
                      <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                        Pack Sizes & Prices (Variants)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          placeholder="e.g. 500g, 1kg"
                          className="w-1/2 bg-whiteBg border border-borderCol focus:border-emeraldGreen rounded-xl text-[11px] py-1.5 px-2 text-primaryTxt"
                        />
                        <input
                          type="number"
                          min="0"
                          value={newSizePrice}
                          onChange={(e) => setNewSizePrice(Number(e.target.value))}
                          placeholder="Price"
                          className="w-1/3 bg-whiteBg border border-borderCol focus:border-emeraldGreen rounded-xl text-[11px] py-1.5 px-2 text-primaryTxt font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleAddPackSize}
                          className="bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg font-black rounded-lg text-[10px] px-2.5 py-1.5 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Variant List display */}
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {packSizes.length > 0 ? (
                          packSizes.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-whiteBg px-2.5 py-1.5 rounded-lg border border-borderCol text-xs">
                              <span className="font-bold text-primaryTxt">{item.size}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-emeraldGreen">₹{item.price}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePackSize(idx)}
                                  className="text-red-500 hover:text-red-400 p-0.5"
                                >
                                  <FaTrash className="text-[10px]" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-mutedTxt italic">No variants added yet</div>
                        )}
                      </div>
                    </div>

                    {/* Flavors list */}
                    <div className="bg-lightgraySec/50 p-4 rounded-2xl border border-borderCol space-y-3">
                      <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                        Flavors List
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFlavor}
                          onChange={(e) => setNewFlavor(e.target.value)}
                          placeholder="e.g. Chocolate, Vanilla"
                          className="w-3/4 bg-whiteBg border border-borderCol focus:border-emeraldGreen rounded-xl text-[11px] py-1.5 px-2 text-primaryTxt"
                        />
                        <button
                          type="button"
                          onClick={handleAddFlavor}
                          className="bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg font-black rounded-lg text-[10px] px-2.5 py-1.5 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Flavor List display */}
                      <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                        {flavors.length > 0 ? (
                          flavors.map((flv, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center bg-whiteBg border border-borderCol px-2 py-1 rounded-lg text-[11px] font-bold text-primaryTxt shadow-sm"
                            >
                              <span>{flv}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFlavor(idx)}
                                className="text-red-500 hover:text-red-400 ml-1.5"
                              >
                                <FaTimes className="text-[9px]" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <div className="text-[10px] text-mutedTxt italic w-full">No flavors added yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about ingredients, pack properties, protein ratios..."
                  rows="3"
                  className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2.5 px-3.5 text-primaryTxt"
                ></textarea>
              </div>

              {/* Status active/inactive */}
              <div className="flex items-center space-x-3 bg-lightgraySec/50 p-3.5 rounded-2xl border border-borderCol">
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`text-2xl transition-colors duration-150 flex items-center ${
                    active ? 'text-emeraldGreen' : 'text-slate-400'
                  }`}
                >
                  {active ? <FaToggleOn className="text-3xl" /> : <FaToggleOff className="text-3xl" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-primaryTxt block">Product Status</span>
                  <span className="text-[10px] text-secondaryTxt font-semibold">
                    {active ? 'Visible on billing grid for fast lookup' : 'Hidden from billing grid'}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-2.5 pt-4 border-t border-borderCol">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-lightgraySec hover:bg-borderCol text-xs font-bold rounded-2xl text-secondaryTxt border border-borderCol"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emeraldGreen hover:bg-emeraldGreenHover text-xs font-black rounded-2xl text-whiteBg shadow-lg shadow-emeraldGreen/10 flex items-center justify-center space-x-2"
                >
                  <FaCheck />
                  <span>{editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
