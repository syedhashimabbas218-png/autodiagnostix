import React from 'react';
import SeoHead from '../components/SeoHead';
import { organizationSchema, websiteSchema } from '../utils/schema';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CategoryNav from '../components/CategoryNav';
import { NewArrivals, Stats, ImmersiveCategories, WorkshopSolutions, InteractiveLifts, CTABanner, Footer } from '../components/HomeComponents';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-surface text-on-surface selection:bg-primary selection:text-white">
            <SeoHead
                title="Home"
                canonical="https://autodiagnostix.com/"
                description="Precision engineering for automotive professionals. Browse professional diagnostic scanners, TPMS tools, ADAS calibration equipment, and workshop solutions."
                jsonLd={[organizationSchema(), websiteSchema()]}
            />
            <Header />
            <Hero />
            <CategoryNav />
            <NewArrivals />
            <Stats />
            <ImmersiveCategories />
            <WorkshopSolutions />
            <InteractiveLifts />
            <CTABanner />
            <Footer />
        </div>
    );
}
