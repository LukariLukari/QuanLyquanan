import { create } from 'zustand';

interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  price: number;
  cost: number;
  quantity: number;
  note?: string;
}

interface PosState {
  selectedTableId: string | null;
  currentOrder: {
    id?: string;
    items: OrderItem[];
    discount: number;
    surcharge: number;
    vat: number;
  } | null;
  
  setSelectedTable: (tableId: string | null, order?: any) => void;
  addItem: (item: any) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  setDiscount: (val: number) => void;
  setSurcharge: (val: number) => void;
  clearOrder: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  selectedTableId: null,
  currentOrder: null,

  setSelectedTable: (tableId, order) => set({
    selectedTableId: tableId,
    currentOrder: order ? {
      id: order.id,
      items: order.items || [],
      discount: order.discount || 0,
      surcharge: order.surcharge || 0,
      vat: order.vat || 0
    } : { items: [], discount: 0, surcharge: 0, vat: 10 }
  }),

  addItem: (menuItem) => set((state) => {
    if (!state.currentOrder) return state;
    const existingItem = state.currentOrder.items.find(i => i.menuItemId === menuItem.id);
    if (existingItem) {
      return {
        currentOrder: {
          ...state.currentOrder,
          items: state.currentOrder.items.map(i => 
            i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
      };
    }
    return {
      currentOrder: {
        ...state.currentOrder,
        items: [...state.currentOrder.items, {
          id: Math.random().toString(),
          menuItemId: menuItem.id,
          itemName: menuItem.name,
          price: menuItem.price,
          cost: menuItem.cost || 0,
          quantity: 1
        }]
      }
    };
  }),

  updateItemQuantity: (id, quantity) => set((state) => {
    if (!state.currentOrder) return state;
    if (quantity <= 0) return state;
    return {
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.map(i => i.id === id ? { ...i, quantity } : i)
      }
    };
  }),

  removeItem: (id) => set((state) => {
    if (!state.currentOrder) return state;
    return {
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.filter(i => i.id !== id)
      }
    };
  }),

  setDiscount: (val) => set((state) => {
    if (!state.currentOrder) return state;
    return { currentOrder: { ...state.currentOrder, discount: val } };
  }),

  setSurcharge: (val) => set((state) => {
    if (!state.currentOrder) return state;
    return { currentOrder: { ...state.currentOrder, surcharge: val } };
  }),

  clearOrder: () => set({ selectedTableId: null, currentOrder: null })
}));
