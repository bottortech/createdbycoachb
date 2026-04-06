"use client";

import GalleryNav from "@/components/GalleryNav";
import Entrance from "@/components/sections/Entrance";
import FeaturedExhibit from "@/components/sections/FeaturedExhibit";
import ProductWing from "@/components/sections/ProductWing";
import CreativeGallery from "@/components/sections/CreativeGallery";
import AuthorExhibit from "@/components/sections/AuthorExhibit";
import GovernmentEnterprise from "@/components/sections/GovernmentEnterprise";
import Studio from "@/components/sections/Studio";
import BookCall from "@/components/sections/BookCall";
import CommissionDesk from "@/components/sections/CommissionDesk";
import SocialWall from "@/components/sections/SocialWall";

export default function Home() {
  return (
    <main className="relative bg-gallery-black gallery-ambient">
      <GalleryNav />
      <Entrance />
      <FeaturedExhibit />
      <ProductWing />
      <CreativeGallery />
      <AuthorExhibit />
      <GovernmentEnterprise />
      <Studio />
      <BookCall />
      <CommissionDesk />
      <SocialWall />
    </main>
  );
}
