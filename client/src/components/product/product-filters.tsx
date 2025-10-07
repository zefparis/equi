import { useState } from "react";
import { useLanguage } from "../../hooks/use-language";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Filter, X } from "lucide-react";

interface ProductFiltersProps {
  activeTab: "selles" | "accessoires";
  onFiltersChange: (filters: {
    categories: string[];
    subcategories: string[];
    sizes: string[];
    priceRange: [number, number];
  }) => void;
}

const categories = ["Obstacle", "Dressage", "Cross", "Mixte", "Poney"];
const subcategories = ["Sangles", "Etrivieres", "Etriers", "Amortisseurs", "Tapis", "Briderie", "Couvertures", "Protections", "Autre"];
const sizes = ["16", "16.5", "17", "17.5", "18", "18.5"];

export default function ProductFilters({ activeTab, onFiltersChange }: ProductFiltersProps) {
  const { t } = useLanguage();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    onFiltersChange({
      categories: newCategories,
      subcategories: selectedSubcategories,
      sizes: selectedSizes,
      priceRange
    });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, size]
      : selectedSizes.filter(s => s !== size);
    
    setSelectedSizes(newSizes);
    onFiltersChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sizes: newSizes,
      priceRange
    });
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    onFiltersChange({
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      sizes: selectedSizes,
      priceRange: newRange
    });
  };

  const handleSubcategoryChange = (subcategory: string, checked: boolean) => {
    const newSubcategories = checked
      ? [...selectedSubcategories, subcategory]
      : selectedSubcategories.filter(sc => sc !== subcategory);
    
    setSelectedSubcategories(newSubcategories);
    onFiltersChange({
      categories: selectedCategories,
      subcategories: newSubcategories,
      sizes: selectedSizes,
      priceRange
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setPriceRange([0, 2000]);
    onFiltersChange({
      categories: [],
      subcategories: [],
      sizes: [],
      priceRange: [0, 2000]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories pour les selles */}
        {activeTab === "selles" && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {t("filter.category")}
            </Label>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label htmlFor={category} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sous-catégories pour les accessoires */}
        {activeTab === "accessoires" && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {t("filter.subcategory")}
            </Label>
            <div className="space-y-2">
              {subcategories.map(subcategory => (
                <div key={subcategory} className="flex items-center space-x-2">
                  <Checkbox
                    id={subcategory}
                    checked={selectedSubcategories.includes(subcategory)}
                    onCheckedChange={(checked) => 
                      handleSubcategoryChange(subcategory, checked as boolean)
                    }
                  />
                  <Label htmlFor={subcategory} className="text-sm">
                    {subcategory}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sizes - uniquement pour les selles */}
        {activeTab === "selles" && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              {t("filter.size")}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={size}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={(checked) => 
                      handleSizeChange(size, checked as boolean)
                    }
                  />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            {t("filter.price")}
          </Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{priceRange[0]} €</span>
              <span>{priceRange[1]} €</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
