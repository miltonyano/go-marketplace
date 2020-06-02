import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      productsStoraged && setProducts(JSON.parse(productsStoraged));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      setProducts(
        products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productInCart = products.find(item => item.id === product.id);

      if (productInCart) {
        await increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
