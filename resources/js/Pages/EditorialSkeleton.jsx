import React from 'react';

export default function EditorialSkeleton() {
    return (
        <div className="animate-fade-in duration-300">
            {/* Category Bar Skeleton */}
            <div className="flex gap-4 mb-12 border-b border-outline-variant dark:border-zinc-800 pb-4 overflow-x-auto">
                <div className="w-20 h-6 skeleton shrink-0"></div>
                <div className="w-24 h-6 skeleton shrink-0"></div>
                <div className="w-16 h-6 skeleton shrink-0"></div>
                <div className="w-28 h-6 skeleton shrink-0"></div>
                <div className="w-20 h-6 skeleton shrink-0"></div>
                <div className="w-24 h-6 skeleton shrink-0"></div>
            </div>

            {/* Hero Bento Grid Section */}
            <section className="editorial-grid mb-20">
                {/* Main Hero Placeholder (8 Columns) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="aspect-[16/9] w-full skeleton-dark relative overflow-hidden">
                        <div className="absolute inset-0 border-[1px] border-white/10"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="w-24 h-4 skeleton"></div>
                        <div className="w-full h-10 skeleton-dark"></div>
                        <div className="w-3/4 h-10 skeleton-dark"></div>
                        <div className="w-full h-4 skeleton"></div>
                        <div className="w-full h-4 skeleton"></div>
                    </div>
                </div>

                {/* Side Sidebar (4 Columns) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <div className="border-t border-outline-variant dark:border-zinc-800 pt-4">
                        <div className="w-32 h-4 skeleton mb-6"></div>
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col gap-3">
                                    <div className="w-20 h-3 skeleton"></div>
                                    <div className="w-full h-6 skeleton-dark"></div>
                                    <div className="w-2/3 h-6 skeleton-dark"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Secondary Feature Card */}
                    <div className="bg-surface-container dark:bg-zinc-900 p-6 flex flex-col gap-4">
                        <div className="aspect-square w-full skeleton-dark"></div>
                        <div className="w-3/4 h-6 skeleton"></div>
                    </div>
                </div>
            </section>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 border-b border-primary dark:border-zinc-700 pb-2">
                <div className="w-48 h-8 skeleton-dark"></div>
                <div className="w-24 h-4 skeleton"></div>
            </div>

            {/* Article Grid */}
            <section className="editorial-grid">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-4">
                        <div className="aspect-[4/3] w-full skeleton-dark"></div>
                        <div className="space-y-3">
                            <div className="w-16 h-3 skeleton"></div>
                            <div className="w-full h-6 skeleton-dark"></div>
                            <div className="w-3/4 h-6 skeleton-dark"></div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}