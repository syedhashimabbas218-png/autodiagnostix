import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { breadcrumbListSchema, productSchema } from '../utils/schema';
import ProductPage from './ProductPage';
import { getProducts } from '../payloadApi';

export default function ProductWrapper() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getProducts()
            .then(data => {
                const found = data.find(p => p.id === id);
                setProduct(found);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching product:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Loading Product...</div>;
    if (!product) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Product Not Found</div>;

    const breadcrumbs = product ? [
        { name: 'Home', url: 'https://autodiagnostix.com/' },
        { name: product.category || 'Products', url: `https://autodiagnostix.com/category/${(product.category || '').toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}` },
        { name: product.name, url: `https://autodiagnostix.com/product/${id}` },
    ] : [];

    return (
        <>
            <SeoHead
                title={product?.name}
                description={product?.summary || product?.description?.substring(0, 160) || ''}
                canonical={`https://autodiagnostix.com/product/${id}`}
                ogType="product"
                jsonLd={[
                    ...(product ? [productSchema(product)] : []),
                    breadcrumbListSchema(breadcrumbs),
                ]}
            />
            <ProductPage
            {...product}
            title={product.name}
            tagline={product.brand}
            heroImages={product.heroImages}
            badge={product.badge}
            specs={product.technicalTable && product.technicalTable.length > 0 ? product.technicalTable : (product.specs || []).map(s => ({ label: "Feature", value: s }))}
            features={(product.features || []).map((f, i) => ({
                ...f,
                highlight: f.title,
                image: f.image || '',
                points: [f.description.substring(0, 30), "Professional Choice"],
                icons: ["verified", "bolt"],
                reverse: i % 2 !== 0,
                bg: i % 2 === 0 ? "bg-surface" : "bg-surface-container-low"
            }))}
        />
        </>
    );
}
