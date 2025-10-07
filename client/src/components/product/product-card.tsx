import { Link } from "wouter";
import { useCart } from "../../hooks/use-cart";
import { useLanguage } from "../../hooks/use-language";
import { Product } from "@shared/schema";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  return (
    <Card className="product-card overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {hasDiscount && (
            <Badge className="absolute top-4 left-4 bg-red-500">
              -
              {Math.round(
                ((parseFloat(product.originalPrice!) - parseFloat(product.price)) /
                  parseFloat(product.originalPrice!)) *
                  100
              )}
              %
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{t(`product.description.${product.id}`) || product.description}</p>
        
        {/* Details produit - couleur, état, localisation */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Taille: {product.size}</span>
            {!product.inStock && (
              <Badge variant="destructive" className="text-xs">Vendu</Badge>
            )}
            {product.inStock && (
              <Badge variant="default" className="text-xs bg-green-600">Disponible</Badge>
            )}
          </div>
          
          {product.color && product.category !== "Accessoires" && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Couleur:</span> {product.color}
            </div>
          )}
          
          {/* Afficher la sous-catégorie appropriée pour les accessoires */}
          {product.category === "Accessoires" && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Type:</span> {
                product.subcategory === "Autre" && product.customSubcategory
                  ? product.customSubcategory
                  : product.subcategory
              }
            </div>
          )}
          
          {product.condition && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">État:</span> {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </div>
          )}
          
          {product.location && (
            <div className="text-gray-600 dark:text-gray-400">
              📍 {product.location}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {parseFloat(product.price).toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 line-through">
                {parseFloat(product.originalPrice!).toFixed(2)} €
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="ml-2 text-gray-500 text-sm">(24 avis)</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full btn-primary"
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? t("product.addToCart") : "Produit vendu"}
        </Button>
      </CardFooter>
    </Card>
  );
}
