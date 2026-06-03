import React, {useState, useEffect} from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function About() {
    const [scrollProgress, setScrollProgress] = useState(0);
    useEffect(() => {
            const handleScroll = () => {
                const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
                if (totalScroll > 0) {
                    const currentScroll = window.scrollY;
                    const progress = (currentScroll / totalScroll) * 100;
                    setScrollProgress(progress);
                }
            };
    
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }, []);

    return (
        <MainLayout activePage="about">
            <Head title="About | The Modern Broadsheet" />

            {/* Reading Progress Bar */}
            <div 
                className="fixed top-0 left-0 h-[2px] bg-secondary z-[100] transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <main className="max-w-content-max-width mx-auto px-margin-edge bg-surface dark:bg-[#121212] dark:text-on-secondary border-outline-variant dark:border-zinc-800">
                {/* Hero Section */}
                <section className="py-section-gap grid grid-cols-12 gap-gutter">
                    <div className="col-span-12 md:col-span-8">
                        <span className="font-label-caps text-label-caps text-secondary dark:text-amber-500 mb-4 block">OUR MANIFESTO</span>
                        <h1 className="font-display-xl text-display-xl mb-8 text-primary dark:text-on-secondary">
                            Clarity in a cluttered age. Editorial rigor for the modern mind.
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-on-primary-container max-w-2xl">
                            The Modern Broadsheet was founded on a simple premise: that the digital world deserves the same architectural grace and intellectual depth as the great print journals of the 20th century.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-full h-px bg-outline-variant mb-section-gap"></div>

                {/* The Story Section */}
                <section className="mb-section-gap grid grid-cols-12 gap-gutter">
                    <aside className="col-span-12 md:col-span-3">
                        <div className="sticky top-32">
                            <h2 className="font-label-caps text-label-caps text-primary dark:text-on-secondary mb-6">THE GENESIS</h2>
                            <p className="text-on-surface-variant dark:text-on-primary-container font-body-md italic mb-4">"We don't aggregate; we curate. We don't skim; we delve."</p>
                            <p className="text-outline text-label-caps">EST. MMXIV — LONDON</p>
                        </div>
                    </aside>
                    <div className="col-span-12 md:col-span-7 md:col-start-5 space-y-8">
                        <p className="font-body-lg text-body-lg">
                            In 2014, a small collective of journalists and designers gathered in a quiet studio with a shared frustration. The internet had become a chaotic marketplace of attention, where speed often compromised substance. We envisioned a sanctuary—a digital broadsheet that prioritized the reader's cognitive space.
                        </p>
                        <div className="aspect-video w-full overflow-hidden mb-8 bg-surface-container">
                            <img 
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMFtcDAfVm8svzkDG2utwlgCxPJrsyn0_naRbBUEqkzDE5Dh9p4W3LCCWBDeNqxW-uuEQueZVbkszMhR1h3DAp1aoSTU-v_0RixNc3euFH_yV4wvRdxD9ZpkQWdT_3J6tw7CJfl6BIe67pdAYzZQRqEAHYU4IO7nVuXRV_wHMjheluL1hTRbk2QXDjRr70xHJbGrdZwB1sgcxtu42SSwson6BXtPXdaQHx6ISEQeGrKOY7Sw1a-die3fq1PNP7Dn9O4-DtqJOF7QXU" 
                                alt="Vintage printing press"
                            />
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-justify">
                            Our mission is to provide rigorous reporting and nuanced analysis across culture, technology, and global affairs. We believe that minimalist design isn't just an aesthetic choice—it is a functional requirement for deep focus. By stripping away the intrusive ads and sensory noise, we allow the ideas to stand on their own.
                        </p>
                    </div>
                </section>

                {/* Principles of the Press */}
                <section className="mb-section-gap">
                    <h2 className="font-headline-lg text-headline-lg mb-12 text-center">Principles of the Press</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: 'verified', title: 'Fact-First Integrity', desc: 'Every long-form feature undergoes a three-stage verification process to ensure absolute accuracy.' },
                            { icon: 'auto_awesome', title: 'Aesthetic Clarity', desc: 'Our UI is designed to disappear, putting the focus entirely on the typography and information.' },
                            { icon: 'history_edu', title: 'Intellectual Rigor', desc: 'We value depth over breadth. Our contributors are experts, historians, and practitioners.' }
                        ].map((principle, i) => (
                            <div key={i} className="p-8 border border-outline-variant flex flex-col items-start hover:shadow-sm transition-shadow">
                                <span className="material-symbols-outlined text-secondary mb-6 text-[32px]">{principle.icon}</span>
                                <h3 className="font-headline-md text-headline-md mb-4">{principle.title}</h3>
                                <p className="text-on-surface-variant font-body-md">{principle.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Editorial Team */}
                <section className="mb-section-gap">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="font-label-caps text-label-caps text-secondary block mb-2">THE EDITORIAL BOARD</span>
                            <h2 className="font-headline-lg text-headline-lg text-primary">Leading the Conversation</h2>
                        </div>
                        <p className="hidden md:block font-body-md text-on-surface-variant max-w-sm">A global team of curators and writers dedicated to the art of the broadsheet.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
                        {[
                            { name: 'ELIAS VANCE', role: 'Editor-in-Chief', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF4iTQSpzcQtyc_Faj9R2hDuxpuB17_Nj2rRTG1MK9jQV4-KhRusDHx1cYB8l3IAo7q6C1_0KFoIFJqle8BbObO11KghrZkXxqZuI7TvTQRDxQWlA7sIANauFSZkYKz-hekAsCPQD8F_h5tzH9XYuo21QxdVJN8kNMOIvzvGIINKkRyG0zz_RCDc9lsD5g6AYFQ61vRf4PZxrqIBP1ZWv_VlCncMDNs-4uIWUUOfZaTz__LEepamaTqZBd-Ekc2weMWHaF0EfPdq63' },
                            { name: 'SARAH CHEN', role: 'Director of Strategy', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZtoJhljEiNnHFNQMtNMTJxUyXEMrTHQ2272Y5KoUJATj9tlWnCoYdeB7zs5x50E31RAsMkGrbuwMYpTA4rHbHbdKYPSFruCaIFp0F6_XKE0WCT79OrpLWZUmmcVXaGtwsB-OAXoOWHzP2YY4vgzl9quAcRhCyUk0GhgvmpXtvHcpYxHhrfiGB17-u79s-7fvWYBDxnx1LSyREcQQVKIt58vkS7LBmsibEYlsMzdsbQvj6zv1xmLinmiw70eO2WANO_XqGk9ppyN5d' },
                            { name: 'JULIAN ROSS', role: 'Art Director', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCrcDTz1cOAkv0ABkwINbP2kvPKK8bFr065a5VODeYfMsSNwKEYS5rvkx8E-UjTVsV5SiWYddkqbyhtKTFDDDKiKhOLcvc-6yir7iu4jdJvfmyuHhUdMkgAtRGUI1u0ExDz2Hp1vz4Ucmx3x0meqzLPjFagnAW_IVCMWlws9JlsKdRznX4jVmRfLi1CgAUY5Q-uRQzMvO-32co_tiA5sXT25w-g-bF6QidW-RjET2UdODw8tH2NljKtQL_Gw5PUC8UMdFiaFgbvfv9' },
                            { name: 'ELARA MORGAN', role: 'Lead Investigative Reporter', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NZ6rg0uGDkYuRAY60enhrAhDEeCJlBqiGGOijaU8q1pVwOJ3oKg-58K7cHcpgGE2fxGs5Szj4mZ2lSv4x17dF2LAmvm8ZPvgTTvw538Ja2pxGrGOsBgaP3xEp5i7wXU74GhcDVV0sW37hsaCyrZUnUjigTglWncNWv02tgIcuyueIqkmZku_wKjkT9P-GpwV0H_7AqMb1AxnOFDnCOdIsKZcdpl_Hr-vIrnEVaeNFPADAhl_auZz3mbslNFuwUqvNcG3AMmCo_bB' },
                            { name: 'Ajo', role: 'Pemancing', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NZ6rg0uGDkYuRAY60enhrAhDEeCJlBqiGGOijaU8q1pVwOJ3oKg-58K7cHcpgGE2fxGs5Szj4mZ2lSv4x17dF2LAmvm8ZPvgTTvw538Ja2pxGrGOsBgaP3xEp5i7wXU74GhcDVV0sW37hsaCyrZUnUjigTglWncNWv02tgIcuyueIqkmZku_wKjkT9P-GpwV0H_7AqMb1AxnOFDnCOdIsKZcdpl_Hr-vIrnEVaeNFPADAhl_auZz3mbslNFuwUqvNcG3AMmCo_bB' }
                        ].map((member, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[3/4] mb-4 bg-surface-container-high relative overflow-hidden">
                                    <img 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                        src={member.img} 
                                        alt={member.name}
                                    />
                                </div>
                                <h4 className="font-label-caps text-label-caps text-primary">{member.name}</h4>
                                <p className="text-on-surface-variant text-[14px]">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section className="mb-section-gap py-section-gap bg-surface-container-low px-12">
                    <div className="grid grid-cols-12 gap-gutter">
                        <div className="col-span-12 md:col-span-5">
                            <h2 className="font-headline-lg text-headline-lg mb-6 text-primary">Connect with the Editorial Desk</h2>
                            <p className="font-body-md text-on-surface-variant mb-8">For story tips, general inquiries, or partnership opportunities, our lines remain open.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-secondary">mail</span>
                                    <span className="font-body-md">editorial@modernbroadsheet.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-secondary">location_on</span>
                                    <span className="font-body-md">24 Curzon St, London W1J 7TF, UK</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-6 md:col-start-7">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-caps text-label-caps text-outline uppercase">Full Name</label>
                                        <input className="bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 outline-none transition-colors" type="text" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-caps text-label-caps text-outline uppercase">Email Address</label>
                                        <input className="bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 outline-none transition-colors" type="email" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-caps text-label-caps text-outline uppercase">Subject</label>
                                    <input className="bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 outline-none transition-colors" type="text" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-caps text-label-caps text-outline uppercase">Message</label>
                                    <textarea className="bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 outline-none transition-colors resize-none" rows="4"></textarea>
                                </div>
                                <button className="bg-primary text-on-primary w-full py-4 font-label-caps text-label-caps hover:bg-secondary transition-colors tracking-widest uppercase">
                                    Send Dispatch
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </MainLayout>
    );
}