import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductImage, InsertProductImage } from "@shared/schema";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Upload, Download, Trash2, Star, StarOff, Image as ImageIcon } from "lucide-react";

interface ProductImageManagerProps {
  productId: number;
}

export default function ProductImageManager({ productId }: ProductImageManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    url: "",
    alt: "",
    filename: "",
    originalName: "",
    mimeType: "image/jpeg",
    size: 0,
    isMain: false
  });

  // Fetch product images
  const { data: images, isLoading } = useQuery<ProductImage[]>({
    queryKey: [`/api/products/${productId}/images`],
  });

  // Create image mutation
  const createImageMutation = useMutation({
    mutationFn: (data: InsertProductImage) => apiRequest("POST", `/api/products/${productId}/images`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
      setShowUploadDialog(false);
      setUploadForm({
        url: "",
        alt: "",
        filename: "",
        originalName: "",
        mimeType: "image/jpeg",
        size: 0,
        isMain: false
      });
      toast({
        title: "Image ajoutée",
        description: "L'image a été ajoutée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'image",
        variant: "destructive",
      });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => apiRequest("DELETE", `/api/products/${productId}/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    },
  });

  // Set main image mutation
  const setMainImageMutation = useMutation({
    mutationFn: (imageId: number) => apiRequest("PUT", `/api/products/${productId}/images/${imageId}/main`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/images`] });
      toast({
        title: "Image principale définie",
        description: "L'image principale a été mise à jour",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de définir l'image principale",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate filename from URL if not provided
    const filename = uploadForm.filename || uploadForm.url.split('/').pop() || 'image.jpg';
    
    createImageMutation.mutate({
      ...uploadForm,
      productId,
      filename,
      originalName: uploadForm.originalName || filename,
      size: uploadForm.size || 1000, // Default size
    });
  };

  const handleDownload = (image: ProductImage) => {
    const filename = image.filename || image.url.split('/').pop() || 'image.jpg';
    const link = document.createElement('a');
    link.href = `/api/images/download/${filename}`;
    link.download = image.originalName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement démarré",
      description: "Le téléchargement de l'image a commencé",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Images du produit</h3>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Ajouter une image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle image</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle image pour ce produit en renseignant l'URL et les informations requises.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">URL de l'image</Label>
                <Input
                  id="url"
                  type="url"
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  placeholder="/images/selle-example.jpg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="alt">Texte alternatif</Label>
                <Input
                  id="alt"
                  value={uploadForm.alt}
                  onChange={(e) => setUploadForm({ ...uploadForm, alt: e.target.value })}
                  placeholder="Description de l'image"
                  required
                />
              </div>
              <div>
                <Label htmlFor="filename">Nom du fichier</Label>
                <Input
                  id="filename"
                  value={uploadForm.filename}
                  onChange={(e) => setUploadForm({ ...uploadForm, filename: e.target.value })}
                  placeholder="selle-example.jpg"
                />
              </div>
              <div>
                <Label htmlFor="originalName">Nom original</Label>
                <Input
                  id="originalName"
                  value={uploadForm.originalName}
                  onChange={(e) => setUploadForm({ ...uploadForm, originalName: e.target.value })}
                  placeholder="Nom original du fichier"
                />
              </div>
              <div className="flex items-center space-x-2">
                {/* FIX: label for/id - Changed input to Checkbox component for consistency */}
                <Checkbox
                  id="isMain"
                  checked={uploadForm.isMain}
                  onCheckedChange={(checked: boolean) => setUploadForm({ ...uploadForm, isMain: checked })}
                />
                <Label htmlFor="isMain">Image principale</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createImageMutation.isPending}>
                  {createImageMutation.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images?.map((image) => (
          <Card key={image.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <CardTitle className="text-sm">{image.alt}</CardTitle>
                </div>
                {image.isMain && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <div>Fichier: {image.filename}</div>
                  <div>Taille: {(image.size / 1024).toFixed(1)} KB</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(image)}
                      className="px-2"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMainImageMutation.mutate(image.id)}
                      disabled={image.isMain || setMainImageMutation.isPending}
                      className="px-2"
                    >
                      {image.isMain ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImageMutation.mutate(image.id)}
                    disabled={deleteImageMutation.isPending}
                    className="px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!images || images.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Aucune image trouvée pour ce produit</p>
          <p className="text-sm text-gray-400 mt-2">Cliquez sur "Ajouter une image" pour commencer</p>
        </div>
      ) : null}
    </div>
  );
}